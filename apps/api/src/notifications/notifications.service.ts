import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { WhatsappService } from './services/whatsapp.service';
import { ConfigService } from '@nestjs/config';
import { QueueService } from '../queue/queue.service';
import { QUEUE_NAMES } from '../queue/queue.constants';
import {
  NotificationJobType,
  SendEmailJobData,
  SendSmsJobData,
  SendWhatsAppJobData,
  CreateInAppNotificationJobData,
} from './jobs/notifications.queue';
import {
  PaginationQueryDto,
  buildOrderBy,
  buildCursorWhere,
  extractCursor,
  PaginatedResponse,
} from '../common/pagination';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService,
    private whatsappService: WhatsappService,
    private configService: ConfigService,
    private queueService: QueueService,
  ) {}

  /**
   * Envoie une confirmation de RDV (email + optionnel SMS/WhatsApp)
   */
  async sendAppointmentConfirmation(appointmentId: string): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        lead: true,
        assignedCloser: true,
      },
    });

    if (!appointment || !appointment.lead.email) {
      return;
    }

    const closerName = `${appointment.assignedCloser.firstName} ${appointment.assignedCloser.lastName}`;

    // Préparer le contenu de l'email
    const subject = 'Confirmation de votre rendez-vous';
    const html = `
      <h2>Votre rendez-vous est confirmé</h2>
      <p>Bonjour,</p>
      <p>Votre rendez-vous avec ${closerName} est confirmé pour le ${appointment.scheduledAt.toLocaleDateString('fr-FR')} à ${appointment.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.</p>
      ${appointment.visioUrl ? `<p><a href="${appointment.visioUrl}">Rejoindre la visioconférence</a></p>` : ''}
      <p>À bientôt,<br>L'équipe KLOZD</p>
    `;

    // Créer la notification en base
    const notification = await this.prisma.notification.create({
      data: {
        userId: appointment.assignedCloserId,
        type: 'EMAIL',
        status: 'PENDING',
        title: 'Confirmation de RDV envoyée',
        message: `Confirmation envoyée à ${appointment.lead.email}`,
        recipientEmail: appointment.lead.email,
        metadataJson: JSON.stringify({
          appointmentId: appointment.id,
          leadId: appointment.leadId,
        }),
      },
    });

    // Enqueuer l'email
    const emailJobData: SendEmailJobData = {
      to: appointment.lead.email,
      subject,
      html,
      metadata: {
        userId: appointment.assignedCloserId,
        notificationId: notification.id,
        appointmentId: appointment.id,
      },
    };

    if (this.queueService.isEnabled()) {
      await this.queueService.addJob(
        QUEUE_NAMES.NOTIFICATIONS,
        NotificationJobType.SEND_EMAIL,
        emailJobData,
      );
    } else {
      // Fallback synchrone si la queue est désactivée
      const result = await this.emailService.sendEmail(emailJobData.to, emailJobData.subject, emailJobData.html);
      if (result) {
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'SENT', sentAt: new Date() },
        });
      }
    }

    // SMS si configuré et numéro disponible
    if (appointment.lead.phone && this.configService.get<boolean>('SMS_ENABLED')) {
      const smsMessage = `Rappel RDV KLOZD: ${appointment.scheduledAt.toLocaleDateString('fr-FR')} à ${appointment.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}. ${appointment.visioUrl ? `Lien: ${appointment.visioUrl}` : ''}`;
      
      const smsJobData: SendSmsJobData = {
        to: appointment.lead.phone,
        message: smsMessage,
        metadata: {
          appointmentId: appointment.id,
        },
      };

      if (this.queueService.isEnabled()) {
        await this.queueService.addJob(
          QUEUE_NAMES.NOTIFICATIONS,
          NotificationJobType.SEND_SMS,
          smsJobData,
        );
      } else {
        await this.smsService.sendSms(smsJobData.to, smsJobData.message);
      }
    }

    // WhatsApp si configuré
    if (appointment.lead.phone && this.configService.get<boolean>('WHATSAPP_ENABLED')) {
      const whatsappMessage = `✅ RDV confirmé avec ${closerName}\n📅 ${appointment.scheduledAt.toLocaleDateString('fr-FR')} à ${appointment.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}\n${appointment.visioUrl ? `🔗 ${appointment.visioUrl}` : ''}`;
      
      const whatsappJobData: SendWhatsAppJobData = {
        to: appointment.lead.phone,
        message: whatsappMessage,
        metadata: {
          appointmentId: appointment.id,
        },
      };

      if (this.queueService.isEnabled()) {
        await this.queueService.addJob(
          QUEUE_NAMES.NOTIFICATIONS,
          NotificationJobType.SEND_WHATSAPP,
          whatsappJobData,
        );
      } else {
        await this.whatsappService.sendWhatsApp(whatsappJobData.to, whatsappJobData.message);
      }
    }

    // Mettre à jour l'appointment
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { confirmationSent: true },
    });
  }

  /**
   * Envoie un rappel de RDV (J-1 ou H-1)
   */
  async sendAppointmentReminder(appointmentId: string, reminderType: 'day' | 'hour' = 'day'): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        lead: true,
        assignedCloser: true,
      },
    });

    if (!appointment || !appointment.lead.email) {
      return;
    }

    const closerName = `${appointment.assignedCloser.firstName} ${appointment.assignedCloser.lastName}`;

    // Préparer le contenu de l'email
    const subject = 'Rappel : Votre rendez-vous approche';
    const html = `
      <h2>Rappel de rendez-vous</h2>
      <p>Bonjour,</p>
      <p>Ceci est un rappel : vous avez un rendez-vous avec ${closerName} le ${appointment.scheduledAt.toLocaleDateString('fr-FR')} à ${appointment.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.</p>
      ${appointment.visioUrl ? `<p><a href="${appointment.visioUrl}">Rejoindre la visioconférence</a></p>` : ''}
      <p>À bientôt,<br>L'équipe KLOZD</p>
    `;

    // Enqueuer l'email
    const emailJobData: SendEmailJobData = {
      to: appointment.lead.email,
      subject,
      html,
      metadata: {
        appointmentId: appointment.id,
      },
    };

    if (this.queueService.isEnabled()) {
      await this.queueService.addJob(
        QUEUE_NAMES.NOTIFICATIONS,
        NotificationJobType.SEND_EMAIL,
        emailJobData,
      );
    } else {
      await this.emailService.sendEmail(emailJobData.to, emailJobData.subject, emailJobData.html);
    }

    // SMS si disponible
    if (appointment.lead.phone && this.configService.get<boolean>('SMS_ENABLED')) {
      const smsMessage = `Rappel RDV KLOZD: ${appointment.scheduledAt.toLocaleDateString('fr-FR')} à ${appointment.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}. ${appointment.visioUrl ? `Lien: ${appointment.visioUrl}` : ''}`;
      
      const smsJobData: SendSmsJobData = {
        to: appointment.lead.phone,
        message: smsMessage,
        metadata: {
          appointmentId: appointment.id,
        },
      };

      if (this.queueService.isEnabled()) {
        await this.queueService.addJob(
          QUEUE_NAMES.NOTIFICATIONS,
          NotificationJobType.SEND_SMS,
          smsJobData,
        );
      } else {
        await this.smsService.sendSms(smsJobData.to, smsJobData.message);
      }
    }

    // Mettre à jour l'appointment
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        reminderSent: true,
        lastReminderAt: new Date(),
      },
    });
  }

  /**
   * Envoie une séquence de récupération d'abandon
   */
  async sendAbandonRecovery(abandonId: string): Promise<void> {
    const abandon = await this.prisma.formAbandon.findUnique({
      where: { id: abandonId },
      include: {
        form: true,
      },
    });

    if (!abandon || !abandon.email || abandon.recovered) {
      return;
    }

    const attempt = abandon.recoveryEmailsSent + 1;
    const formUrl = `${this.configService.get<string>('FRONTEND_URL')}/forms/${abandon.form.slug}`;

    // Préparer le contenu de l'email
    const subjects = [
      'Vous n\'avez pas terminé votre demande',
      'Dernière chance : Finalisez votre demande',
      'Offre spéciale pour finaliser aujourd\'hui',
    ];
    const subject = subjects[attempt - 1] || subjects[0];
    const html = `
      <h2>Finalisez votre demande</h2>
      <p>Bonjour,</p>
      <p>Vous avez commencé à remplir le formulaire "${abandon.form.name}" mais ne l'avez pas terminé.</p>
      <p><a href="${formUrl}">Cliquez ici pour finaliser votre demande en 2 minutes</a></p>
      ${attempt === 3 ? '<p><strong>Offre spéciale : -20% si réservation avant vendredi</strong></p>' : ''}
      <p>À bientôt,<br>L'équipe KLOZD</p>
    `;

    // Enqueuer l'email
    const emailJobData: SendEmailJobData = {
      to: abandon.email,
      subject,
      html,
      metadata: {
        abandonId: abandon.id,
        formId: abandon.form.id,
      },
    };

    if (this.queueService.isEnabled()) {
      await this.queueService.addJob(
        QUEUE_NAMES.NOTIFICATIONS,
        NotificationJobType.SEND_EMAIL,
        emailJobData,
      );
    } else {
      await this.emailService.sendEmail(emailJobData.to, emailJobData.subject, emailJobData.html);
    }

    // Mettre à jour l'abandon
    await this.prisma.formAbandon.update({
      where: { id: abandonId },
      data: {
        recoveryEmailsSent: attempt,
        lastRecoveryEmailAt: new Date(),
      },
    });
  }

  /**
   * Crée une notification in-app
   */
  async createInAppNotification(
    userId: string,
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const jobData: CreateInAppNotificationJobData = {
      userId,
      title,
      message,
      metadata,
    };

    if (this.queueService.isEnabled()) {
      await this.queueService.addJob(
        QUEUE_NAMES.NOTIFICATIONS,
        NotificationJobType.CREATE_INAPP_NOTIFICATION,
        jobData,
      );
    } else {
      // Fallback synchrone
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
    }
  }

  /**
   * Récupère toutes les notifications d'un utilisateur avec pagination par curseur
   */
  async findAll(userId: string, pagination: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    const {
      limit = 25,
      cursor,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      q,
    } = pagination;

    let where: any = {
      userId,
    };

    // Recherche textuelle (q)
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Cursor pagination
    const cursorWhere = buildCursorWhere(cursor, sortBy, sortOrder);
    if (cursorWhere) {
      where = {
        AND: [
          where,
          cursorWhere,
        ],
      };
    }

    // Ordering
    const orderBy = buildOrderBy(sortBy, sortOrder, { createdAt: 'desc', id: 'desc' });

    // Fetch one extra item to determine if there's a next page
    const take = limit + 1;
    const data = await this.prisma.notification.findMany({
      where,
      take,
      orderBy,
    });

    // Check if there's a next page
    const hasNextPage = data.length > limit;
    const items = hasNextPage ? data.slice(0, limit) : data;

    // Extract cursor from last item
    const nextCursor = items.length > 0
      ? extractCursor(items[items.length - 1], sortBy)
      : null;

    return new PaginatedResponse(items, limit, nextCursor);
  }

  /**
   * Récupère le nombre de notifications non lues
   */
  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        status: {
          in: ['PENDING', 'SENT', 'DELIVERED'],
        },
        readAt: null,
      },
    });
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId, // S'assurer que la notification appartient à l'utilisateur
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  /**
   * Envoie un email de vérification d'adresse email
   */
  async sendVerificationEmail(email: string, verificationToken: string, firstName: string): Promise<boolean> {
    try {
      // Préparer le contenu de l'email
      const subject = 'Vérifiez votre adresse email - KLOZD';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #fe9b27;">Bienvenue sur KLOZD, ${firstName} !</h2>
          <p>Merci de vous être inscrit sur KLOZD. Pour activer votre compte, veuillez vérifier votre adresse email en utilisant le code de vérification ci-dessous :</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f5f5f5; border: 2px solid #fe9b27; border-radius: 8px; padding: 20px; display: inline-block;">
              <p style="margin: 0; font-size: 14px; color: #666; margin-bottom: 10px;">Votre code de vérification :</p>
              <p style="margin: 0; font-size: 32px; font-weight: bold; color: #fe9b27; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${verificationToken}
              </p>
            </div>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">
            Entrez ce code sur la page de vérification pour activer votre compte.
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Ce code expirera dans 15 minutes. Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
          </p>
          <p style="margin-top: 20px;">
            À bientôt,<br>
            L'équipe KLOZD
          </p>
        </div>
      `;

      const text = `
Bienvenue sur KLOZD, ${firstName} !

Merci de vous être inscrit sur KLOZD. Pour activer votre compte, veuillez vérifier votre adresse email en utilisant le code de vérification suivant :

${verificationToken}

Entrez ce code sur la page de vérification pour activer votre compte.

Ce code expirera dans 15 minutes. Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.

À bientôt,
L'équipe KLOZD
      `;

      const emailJobData: SendEmailJobData = {
        to: email,
        subject,
        html,
        text,
      };

      if (this.queueService.isEnabled()) {
        await this.queueService.addJob(
          QUEUE_NAMES.NOTIFICATIONS,
          NotificationJobType.SEND_EMAIL,
          emailJobData,
        );
        this.logger.log(`✅ Email de vérification enqueué pour ${email}`);
        return true;
      } else {
        // Fallback synchrone
        const result = await this.emailService.sendEmail(email, subject, html, text);
        if (result) {
          this.logger.log(`✅ Email de vérification envoyé à ${email}`);
        } else {
          this.logger.warn(`⚠️ Échec de l'envoi de l'email de vérification à ${email}`);
        }
        return result;
      }
    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'envoi de l'email de vérification à ${email}:`, error);
      return false;
    }
  }

  /**
   * Envoie un email d'invitation à rejoindre une organisation
   */
  async sendInvitationEmail(
    email: string,
    token: string,
    organizationName: string,
    firstName: string,
    lastName: string,
  ): Promise<boolean> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const inviteUrl = `${frontendUrl}/invite/${token}`;
      
      // Préparer le contenu de l'email
      const subject = `Invitation à rejoindre ${organizationName} sur KLOZD`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #FF6B35; margin-bottom: 20px;">Invitation KLOZD</h1>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Bonjour ${firstName} ${lastName},
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Vous avez été invité(e) à rejoindre l'organisation <strong>${organizationName}</strong> sur KLOZD.
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Cliquez sur le bouton ci-dessous pour accepter l'invitation et créer votre compte :
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${inviteUrl}" style="display: inline-block; background-color: #FF6B35; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Accepter l'invitation
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Ou copiez-collez ce lien dans votre navigateur :<br>
              <a href="${inviteUrl}" style="color: #FF6B35; word-break: break-all;">${inviteUrl}</a>
            </p>
            
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              Cette invitation expirera dans 7 jours. Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.
            </p>
            
            <p style="margin-top: 20px;">
              À bientôt,<br>
              L'équipe KLOZD
            </p>
          </div>
        </div>
      `;

      const text = `
Invitation KLOZD

Bonjour ${firstName} ${lastName},

Vous avez été invité(e) à rejoindre l'organisation ${organizationName} sur KLOZD.

Cliquez sur le lien suivant pour accepter l'invitation et créer votre compte :

${inviteUrl}

Cette invitation expirera dans 7 jours. Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.

À bientôt,
L'équipe KLOZD
      `;

      const emailJobData: SendEmailJobData = {
        to: email,
        subject,
        html,
        text,
      };

      if (this.queueService.isEnabled()) {
        await this.queueService.addJob(
          QUEUE_NAMES.NOTIFICATIONS,
          NotificationJobType.SEND_EMAIL,
          emailJobData,
        );
        this.logger.log(`✅ Email d'invitation enqueué pour ${email} (${organizationName})`);
        return true;
      } else {
        // Fallback synchrone
        const result = await this.emailService.sendEmail(email, subject, html, text);
        if (result) {
          this.logger.log(`✅ Email d'invitation envoyé à ${email} pour ${organizationName}`);
        } else {
          this.logger.warn(`⚠️ Échec de l'envoi de l'email d'invitation à ${email}`);
        }
        return result;
      }
    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'envoi de l'email d'invitation à ${email}:`, error);
      return false;
    }
  }
}


