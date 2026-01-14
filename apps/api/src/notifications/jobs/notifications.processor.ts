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
  ) {}

  async onModuleInit() {
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
      const result = await this.emailService.sendEmail(to, subject, html, text);

      // Mettre à jour la notification si un ID est fourni
      if (result && metadata?.notificationId) {
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

      return result;
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'envoi de l'email à ${to}:`, error.message);
      throw error;
    }
  }

  private async handleSendSms(data: SendSmsJobData): Promise<boolean> {
    const { to, message } = data;

    try {
      return await this.smsService.sendSms(to, message);
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'envoi du SMS à ${to}:`, error.message);
      throw error;
    }
  }

  private async handleSendWhatsApp(data: SendWhatsAppJobData): Promise<boolean> {
    const { to, message } = data;

    try {
      return await this.whatsappService.sendWhatsApp(to, message);
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'envoi du WhatsApp à ${to}:`, error.message);
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
