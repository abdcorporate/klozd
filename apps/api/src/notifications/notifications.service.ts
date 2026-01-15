import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { WhatsappService } from './services/whatsapp.service';
import { CalendarIcsService } from './services/calendar-ics.service';
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
    private calendarIcsService: CalendarIcsService,
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
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const apiUrl = this.configService.get<string>('API_URL') || 'http://localhost:3001';
    
    // Vérifier si l'appel est dans moins de 48h
    const hoursUntilAppointment = (appointment.scheduledAt.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    const showVisioLink = appointment.visioUrl && hoursUntilAppointment < 48;
    
    // URL pour télécharger le fichier .ics
    const icsUrl = `${apiUrl}/scheduling/appointments/${appointment.id}/calendar.ics`;
    
    // Contact de la closeuse
    const closerContact: string[] = [];
    if (appointment.assignedCloser.email) {
      closerContact.push(`Email: <a href="mailto:${appointment.assignedCloser.email}">${appointment.assignedCloser.email}</a>`);
    }
    if (appointment.assignedCloser.phone) {
      closerContact.push(`Téléphone: <a href="tel:${appointment.assignedCloser.phone}">${appointment.assignedCloser.phone}</a>`);
    }

    // Préparer le contenu de l'email amélioré
    const subject = '✅ RDV confirmé le ' + appointment.scheduledAt.toLocaleDateString('fr-FR') + ' à ' + appointment.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: bold; }
          .button:hover { background-color: #333; }
          .button-large { padding: 16px 32px; font-size: 16px; }
          .info-box { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .contact-info { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>✅ Votre rendez-vous est confirmé</h2>
          <p>Bonjour ${appointment.lead.firstName || ''},</p>
          <p>Votre rendez-vous avec <strong>${closerName}</strong> est confirmé pour le <strong>${appointment.scheduledAt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à ${appointment.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</strong>.</p>
          
          <div class="info-box">
            <p style="margin: 0;"><strong>Durée :</strong> ${appointment.duration} minutes</p>
            ${showVisioLink ? `<p style="margin: 10px 0 0 0;"><strong>Format :</strong> Visioconférence</p>` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${icsUrl}" class="button button-large">📅 Ajouter à mon calendrier</a>
          </div>

          ${showVisioLink ? `
          <div style="text-align: center; margin: 20px 0;">
            <a href="${appointment.visioUrl}" class="button button-large" style="background-color: #4CAF50;">🎥 Rejoindre la visioconférence</a>
          </div>
          ` : ''}

          ${closerContact.length > 0 ? `
          <div class="contact-info">
            <p><strong>Contact de ${closerName} :</strong></p>
            <p>${closerContact.join('<br>')}</p>
          </div>
          ` : ''}

          <p>À bientôt,<br>L'équipe KLOZD</p>
        </div>
      </body>
      </html>
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
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const apiUrl = this.configService.get<string>('API_URL') || 'http://localhost:3001';
    const icsUrl = `${apiUrl}/scheduling/appointments/${appointment.id}/calendar.ics`;

    let subject: string;
    let html: string;

    if (reminderType === 'day') {
      // Rappel J-1 (24h avant)
      subject = 'Rappel : RDV demain à ' + appointment.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const confirmUrl = `${frontendUrl}/appointments/${appointment.id}/confirm`;
      const rescheduleUrl = `${frontendUrl}/appointments/${appointment.id}/reschedule`;
      
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: bold; }
            .button:hover { background-color: #333; }
            .button-success { background-color: #4CAF50; }
            .button-success:hover { background-color: #45a049; }
            .button-warning { background-color: #ff9800; }
            .button-warning:hover { background-color: #e68900; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>📅 Rappel : Votre rendez-vous approche</h2>
            <p>Bonjour ${appointment.lead.firstName || ''},</p>
            <p>Ceci est un rappel : vous avez un rendez-vous avec <strong>${closerName}</strong> <strong>demain</strong> à <strong>${appointment.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</strong>.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" class="button button-success">✅ Confirmer ma présence</a>
              <a href="${rescheduleUrl}" class="button button-warning">🔄 Reprogrammer</a>
            </div>

            ${appointment.visioUrl ? `
            <div style="text-align: center; margin: 20px 0;">
              <a href="${appointment.visioUrl}" class="button">🎥 Lien visioconférence</a>
            </div>
            ` : ''}

            <p>À bientôt,<br>L'équipe KLOZD</p>
          </div>
        </body>
        </html>
      `;
    } else {
      // Rappel H-1 (1h avant)
      subject = 'Votre appel commence dans 1h';
      
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 20px 40px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 8px; margin: 20px auto; font-weight: bold; font-size: 18px; text-align: center; }
            .button:hover { background-color: #45a049; }
            .button-large { display: block; width: fit-content; margin: 30px auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>⏰ Votre appel commence dans 1h</h2>
            <p>Bonjour ${appointment.lead.firstName || ''},</p>
            <p>Votre rendez-vous avec <strong>${closerName}</strong> commence dans <strong>1 heure</strong> à <strong>${appointment.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</strong>.</p>
            
            ${appointment.visioUrl ? `
            <div style="text-align: center; margin: 40px 0;">
              <a href="${appointment.visioUrl}" class="button button-large">🎥 REJOINDRE L'APPEL</a>
            </div>
            ` : ''}

            <p>À tout de suite,<br>L'équipe KLOZD</p>
          </div>
        </body>
        </html>
      `;
    }

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

  /**
   * Envoie un email de relance pour no-show (J+0 ou J+2)
   */
  async sendNoShowRecoveryEmail(appointmentId: string, daysAfter: 0 | 2): Promise<void> {
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

    // Vérifier si le lead est blacklisté (2ème no-show)
    const isBlacklisted = appointment.lead.status === 'DISQUALIFIED' && 
      appointment.lead.disqualificationReason?.includes('blacklisté');

    if (isBlacklisted && daysAfter === 2) {
      // Ne pas envoyer J+2 si le lead est blacklisté
      return;
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const rescheduleUrl = `${frontendUrl}/book/${appointment.leadId}`;

    let subject: string;
    let html: string;

    if (daysAfter === 0) {
      // Email J+0
      subject = 'Nous avons raté notre RDV, reprogrammez ici';
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; font-size: 16px; }
            .button:hover { background-color: #333; }
            .info-box { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Nous avons raté notre rendez-vous</h2>
            <p>Bonjour ${appointment.lead.firstName || ''},</p>
            <p>Il semble que nous n'ayons pas pu nous connecter pour notre rendez-vous prévu le <strong>${appointment.scheduledAt.toLocaleDateString('fr-FR')} à ${appointment.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</strong>.</p>
            
            <p>Pas de problème ! Nous serions ravis de reprogrammer un nouvel appel avec vous.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${rescheduleUrl}" class="button">📅 Reprogrammer mon rendez-vous</a>
            </div>

            <div class="info-box">
              <p style="margin: 0; font-size: 14px; color: #666;">
                Ce lien vous permettra de choisir un nouveau créneau qui vous convient mieux.
              </p>
            </div>

            <p>À bientôt,<br>L'équipe KLOZD</p>
          </div>
        </body>
        </html>
      `;
    } else {
      // Email J+2
      subject = 'Dernière chance de réserver...';
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; font-size: 16px; }
            .button:hover { background-color: #333; }
            .urgent-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Dernière chance de réserver votre appel</h2>
            <p>Bonjour ${appointment.lead.firstName || ''},</p>
            <p>Il y a 2 jours, nous avions prévu un rendez-vous ensemble, mais nous n'avons pas pu nous connecter.</p>
            
            <div class="urgent-box">
              <p style="margin: 0; font-weight: bold;">⏰ C'est votre dernière chance de réserver un créneau !</p>
            </div>
            
            <p>Nous serions ravis de vous parler et de voir comment nous pouvons vous aider.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${rescheduleUrl}" class="button">📅 Réserver maintenant</a>
            </div>

            <p>À bientôt,<br>L'équipe KLOZD</p>
          </div>
        </body>
        </html>
      `;
    }

    const emailJobData: SendEmailJobData = {
      to: appointment.lead.email,
      subject,
      html,
      metadata: {
        appointmentId: appointment.id,
        leadId: appointment.leadId,
        type: 'no_show_recovery',
        daysAfter,
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

    this.logger.log(`Email de relance no-show J+${daysAfter} envoyé pour l'appointment ${appointmentId}`);
  }

  /**
   * Envoie un message WhatsApp directement (sans passer par la queue)
   * Utilisé pour les notifications urgentes comme les confirmations de RDV
   */
  async sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
    try {
      return await this.whatsappService.sendWhatsApp(to, message);
    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'envoi du message WhatsApp à ${to}:`, error);
      return false;
    }
  }
}


