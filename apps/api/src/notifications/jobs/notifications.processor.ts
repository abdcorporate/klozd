import { Worker, WorkerOptions, Job } from 'bullmq';
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { QueueService } from '../../queue/queue.service';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import {
  NotificationJobType,
  SendEmailJobData,
  SendSmsJobData,
  SendWhatsAppJobData,
  CreateInAppNotificationJobData,
} from './notifications.queue';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';
import { WhatsappService } from '../services/whatsapp.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FailedJobService } from '../../queue/failed-job.service';
import { MessageDeliveryService } from '../services/message-delivery.service';
import { MessageProvider, MessageChannel } from '@prisma/client';
import { isWorkerEnabled } from '../../common/utils/worker.utils';

@Injectable()
export class NotificationsProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsProcessor.name);
  private worker: Worker | null = null;
  private redis: Redis | null = null;

  constructor(
    private queueService: QueueService,
    private emailService: EmailService,
    private smsService: SmsService,
    private whatsappService: WhatsappService,
    private prisma: PrismaService,
    private failedJobService: FailedJobService,
    private configService: ConfigService,
    private messageDeliveryService: MessageDeliveryService,
  ) {}

  async onModuleInit() {
    // Do not start BullMQ processors in API web service - only in worker process
    if (!isWorkerEnabled()) {
      this.logger.log('BullMQ processor disabled (RUN_WORKER !== true), skipping worker initialization');
      return;
    }

    if (!this.queueService.isEnabled()) {
      this.logger.warn('Queue désactivée, worker non démarré');
      return;
    }

    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const redisPort = parseInt(this.configService.get<string>('REDIS_PORT') || '6379', 10);
    const redisTls = this.configService.get<string>('REDIS_TLS') === 'true';

    try {
      if (redisUrl) {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        });
      } else {
        this.redis = new Redis({
          host: redisHost,
          port: redisPort,
          tls: redisTls ? {} : undefined,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        });
      }

      const workerOptions: WorkerOptions = {
        connection: this.redis,
        concurrency: 5, // Traiter 5 jobs en parallèle
      };

      this.worker = new Worker(
        QUEUE_NAMES.NOTIFICATIONS,
        async (job: Job) => {
          return this.processJob(job);
        },
        workerOptions,
      );

      this.worker.on('completed', (job) => {
        this.logger.debug(`Job "${job.name}" (ID: ${job.id}) terminé avec succès`);
      });

      this.worker.on('failed', async (job, error) => {
        this.logger.error(`Job "${job?.name}" (ID: ${job?.id}) échoué:`, error.message);

        // Enregistrer dans le DLQ si le job a échoué définitivement
        if (job && job.attemptsMade >= (job.opts.attempts || 5)) {
          try {
            await this.failedJobService.recordFailedJob(
              QUEUE_NAMES.NOTIFICATIONS,
              job.name || 'unknown',
              job.data,
              error.message,
              job.id,
            );
          } catch (dlqError) {
            this.logger.error('Erreur lors de l\'enregistrement dans le DLQ:', dlqError);
          }
        }
      });

      this.worker.on('error', (error) => {
        this.logger.error('Erreur du worker:', error);
      });

      this.logger.log('✅ Worker de notifications démarré');
    } catch (error) {
      this.logger.error('Erreur lors de l\'initialisation du worker:', error);
    }
  }

  private async processJob(job: Job): Promise<any> {
    const { name, data } = job;

    this.logger.debug(`Traitement du job "${name}" (ID: ${job.id})`);

    switch (name) {
      case NotificationJobType.SEND_EMAIL:
        return this.handleSendEmail(data as SendEmailJobData);

      case NotificationJobType.SEND_SMS:
        return this.handleSendSms(data as SendSmsJobData);

      case NotificationJobType.SEND_WHATSAPP:
        return this.handleSendWhatsApp(data as SendWhatsAppJobData);

      case NotificationJobType.CREATE_INAPP_NOTIFICATION:
        return this.handleCreateInAppNotification(data as CreateInAppNotificationJobData);

      default:
        throw new Error(`Type de job inconnu: ${name}`);
    }
  }

  private async handleSendEmail(data: SendEmailJobData): Promise<boolean> {
    const { to, subject, html, text, metadata } = data;

    try {
      // Determine provider
      const emailProvider = this.configService.get<string>('EMAIL_PROVIDER') || 'RESEND';
      const provider: MessageProvider =
        emailProvider === 'SENDGRID' ? MessageProvider.SENDGRID : MessageProvider.RESEND;

      // Create payload for deduplication
      const payload = {
        to,
        subject,
        html,
        text,
        from: this.configService.get<string>('EMAIL_FROM') || 'noreply@klozd.com',
      };

      // Create or get delivery record (deduplication)
      const delivery = await this.messageDeliveryService.createOrGetDelivery(
        metadata?.organizationId,
        provider,
        MessageChannel.EMAIL,
        to,
        metadata?.templateKey || metadata?.template,
        payload,
        metadata,
      );

      // If already sent, return success (no double send)
      if (delivery.status === 'SENT' || delivery.status === 'DELIVERED') {
        this.logger.log(
          `Duplicate email skipped: ${to} (deliveryId: ${delivery.id}, status: ${delivery.status})`,
        );
        return true;
      }

      // If PENDING and this is a retry, check if we should retry or backoff
      if (delivery.status === 'PENDING') {
        // Check if delivery was created recently (within last 5 minutes)
        // If yes, might be a concurrent retry, skip to avoid double send
        const deliveryRecord = await this.messageDeliveryService.getDelivery(delivery.id);
        if (deliveryRecord) {
          const ageMs = Date.now() - deliveryRecord.createdAt.getTime();
          if (ageMs < 5 * 60 * 1000) {
            // Very recent, might be concurrent, skip
            this.logger.warn(
              `Pending delivery too recent (${ageMs}ms), skipping to avoid double send: ${delivery.id}`,
            );
            return true;
          }
        }
      }

      // Send email
      // sendEmail retourne maintenant le resendId (string) ou throw une erreur
      const resendId = await this.emailService.sendEmail(to, subject, html, text);

      // Mark delivery as sent with provider message ID
      await this.messageDeliveryService.markSent(delivery.id, resendId);

      // Mettre à jour la notification si un ID est fourni
      if (metadata?.notificationId) {
        try {
          await this.prisma.notification.update({
            where: { id: metadata.notificationId },
            data: {
              status: 'SENT',
              sentAt: new Date(),
            },
          });
        } catch (updateError) {
          this.logger.warn(`Impossible de mettre à jour la notification ${metadata.notificationId}:`, updateError);
        }
      }

      return true;
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'envoi de l'email à ${to}:`, error.message);
      
      // Try to mark delivery as failed if we can find it
      try {
        const emailProvider = this.configService.get<string>('EMAIL_PROVIDER') || 'RESEND';
        const provider: MessageProvider =
          emailProvider === 'SENDGRID' ? MessageProvider.SENDGRID : MessageProvider.RESEND;
        const payload = {
          to,
          subject,
          html,
          text,
          from: this.configService.get<string>('EMAIL_FROM') || 'noreply@klozd.com',
        };
        const payloadHash = this.messageDeliveryService.computePayloadHash(payload);
        
        // Find delivery by hash (if exists)
        const whereClause: any = {
          channel: MessageChannel.EMAIL,
          to,
          templateKey: metadata?.templateKey || metadata?.template || null,
          payloadHash,
          status: 'PENDING',
        };
        if (metadata?.organizationId) {
          whereClause.organizationId = metadata.organizationId;
        } else {
          whereClause.organizationId = null;
        }
        const existing = await this.prisma.messageDelivery.findFirst({
          where: whereClause,
        });

        if (existing) {
          await this.messageDeliveryService.markFailed(
            existing.id,
            error.code || 'UNKNOWN_ERROR',
            error.message,
          );
        }
      } catch (markError) {
        // Ignore errors when marking as failed
      }
      
      throw error;
    }
  }

  private async handleSendSms(data: SendSmsJobData): Promise<boolean> {
    const { to, message, metadata } = data;

    try {
      // Create payload for deduplication
      const payload = {
        to,
        message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER') || this.configService.get<string>('SMS_FROM'),
      };

      // Create or get delivery record (deduplication)
      const delivery = await this.messageDeliveryService.createOrGetDelivery(
        metadata?.organizationId,
        MessageProvider.TWILIO,
        MessageChannel.SMS,
        to,
        metadata?.templateKey || metadata?.template,
        payload,
        metadata,
      );

      // If already sent, return success (no double send)
      if (delivery.status === 'SENT' || delivery.status === 'DELIVERED') {
        this.logger.log(
          `Duplicate SMS skipped: ${to} (deliveryId: ${delivery.id}, status: ${delivery.status})`,
        );
        return true;
      }

      // If PENDING and this is a retry, check if we should retry or backoff
      if (delivery.status === 'PENDING') {
        const deliveryRecord = await this.messageDeliveryService.getDelivery(delivery.id);
        if (deliveryRecord) {
          const ageMs = Date.now() - deliveryRecord.createdAt.getTime();
          if (ageMs < 5 * 60 * 1000) {
            this.logger.warn(
              `Pending delivery too recent (${ageMs}ms), skipping to avoid double send: ${delivery.id}`,
            );
            return true;
          }
        }
      }

      // Send SMS
      const result = await this.smsService.sendSms(to, message);

      if (result) {
        // Note: SMS service should return messageId (Twilio SID)
        // For now, we'll mark as sent without providerMessageId
        // TODO: Update SmsService to return messageId
        await this.messageDeliveryService.markSent(delivery.id);
      } else {
        await this.messageDeliveryService.markFailed(
          delivery.id,
          'SMS_SERVICE_FALSE',
          'SMS service returned false',
        );
      }

      return result;
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'envoi du SMS à ${to}:`, error.message);
      
      // Try to mark delivery as failed
      try {
        const payload = {
          to,
          message,
          from: this.configService.get<string>('TWILIO_PHONE_NUMBER') || this.configService.get<string>('SMS_FROM'),
        };
        const payloadHash = this.messageDeliveryService.computePayloadHash(payload);
        
        const whereClause: any = {
          channel: MessageChannel.SMS,
          to,
          templateKey: metadata?.templateKey || metadata?.template || null,
          payloadHash,
          status: 'PENDING',
        };
        if (metadata?.organizationId) {
          whereClause.organizationId = metadata.organizationId;
        } else {
          whereClause.organizationId = null;
        }
        const existing = await this.prisma.messageDelivery.findFirst({
          where: whereClause,
        });

        if (existing) {
          await this.messageDeliveryService.markFailed(
            existing.id,
            error.code || 'UNKNOWN_ERROR',
            error.message,
          );
        }
      } catch (markError) {
        // Ignore
      }
      
      throw error;
    }
  }

  private async handleSendWhatsApp(data: SendWhatsAppJobData): Promise<boolean> {
    const { to, message, metadata } = data;

    try {
      // Create payload for deduplication
      const payload = {
        to,
        message,
        from: this.configService.get<string>('TWILIO_WHATSAPP_NUMBER') || this.configService.get<string>('WHATSAPP_FROM'),
      };

      // Create or get delivery record (deduplication)
      const delivery = await this.messageDeliveryService.createOrGetDelivery(
        metadata?.organizationId,
        MessageProvider.TWILIO, // WhatsApp uses Twilio
        MessageChannel.WHATSAPP,
        to,
        metadata?.templateKey || metadata?.template,
        payload,
        metadata,
      );

      // If already sent, return success (no double send)
      if (delivery.status === 'SENT' || delivery.status === 'DELIVERED') {
        this.logger.log(
          `Duplicate WhatsApp skipped: ${to} (deliveryId: ${delivery.id}, status: ${delivery.status})`,
        );
        return true;
      }

      // If PENDING and this is a retry, check if we should retry or backoff
      if (delivery.status === 'PENDING') {
        const deliveryRecord = await this.messageDeliveryService.getDelivery(delivery.id);
        if (deliveryRecord) {
          const ageMs = Date.now() - deliveryRecord.createdAt.getTime();
          if (ageMs < 5 * 60 * 1000) {
            this.logger.warn(
              `Pending delivery too recent (${ageMs}ms), skipping to avoid double send: ${delivery.id}`,
            );
            return true;
          }
        }
      }

      // Send WhatsApp
      const result = await this.whatsappService.sendWhatsApp(to, message);

      if (result) {
        // Note: WhatsApp service should return messageId (Twilio SID)
        // For now, we'll mark as sent without providerMessageId
        // TODO: Update WhatsappService to return messageId
        await this.messageDeliveryService.markSent(delivery.id);
      } else {
        await this.messageDeliveryService.markFailed(
          delivery.id,
          'WHATSAPP_SERVICE_FALSE',
          'WhatsApp service returned false',
        );
      }

      return result;
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'envoi du WhatsApp à ${to}:`, error.message);
      
      // Try to mark delivery as failed
      try {
        const payload = {
          to,
          message,
          from: this.configService.get<string>('TWILIO_WHATSAPP_NUMBER') || this.configService.get<string>('WHATSAPP_FROM'),
        };
        const payloadHash = this.messageDeliveryService.computePayloadHash(payload);
        
        const whereClause: any = {
          channel: MessageChannel.WHATSAPP,
          to,
          templateKey: metadata?.templateKey || metadata?.template || null,
          payloadHash,
          status: 'PENDING',
        };
        if (metadata?.organizationId) {
          whereClause.organizationId = metadata.organizationId;
        } else {
          whereClause.organizationId = null;
        }
        const existing = await this.prisma.messageDelivery.findFirst({
          where: whereClause,
        });

        if (existing) {
          await this.messageDeliveryService.markFailed(
            existing.id,
            error.code || 'UNKNOWN_ERROR',
            error.message,
          );
        }
      } catch (markError) {
        // Ignore
      }
      
      throw error;
    }
  }

  private async handleCreateInAppNotification(
    data: CreateInAppNotificationJobData,
  ): Promise<void> {
    const { userId, title, message, metadata } = data;

    try {
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'IN_APP',
          status: 'SENT',
          title,
          message,
          metadataJson: metadata ? JSON.stringify(metadata) : null,
          sentAt: new Date(),
        },
      });
    } catch (error: any) {
      this.logger.error(`Erreur lors de la création de la notification in-app pour ${userId}:`, error.message);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.logger.log('Worker de notifications fermé');
    }

    if (this.redis) {
      await this.redis.quit();
    }
  }
}
