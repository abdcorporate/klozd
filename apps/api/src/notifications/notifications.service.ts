import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { WhatsappService } from './services/whatsapp.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService,
    private whatsappService: WhatsappService,
    private configService: ConfigService,
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

    // Email de confirmation
    await this.emailService.sendAppointmentConfirmation(
      appointment.lead.email,
      appointment.scheduledAt,
      closerName,
      appointment.visioUrl || undefined,
    );

    // Enregistrer la notification
    await this.prisma.notification.create({
      data: {
        userId: appointment.assignedCloserId,
        type: 'EMAIL',
        status: 'SENT',
        title: 'Confirmation de RDV envoyée',
        message: `Confirmation envoyée à ${appointment.lead.email}`,
        recipientEmail: appointment.lead.email,
        metadataJson: JSON.stringify({
          appointmentId: appointment.id,
          leadId: appointment.leadId,
        }),
        sentAt: new Date(),
      },
    });

    // SMS si configuré et numéro disponible
    if (appointment.lead.phone && this.configService.get<boolean>('SMS_ENABLED')) {
      await this.smsService.sendAppointmentReminderSms(
        appointment.lead.phone,
        appointment.scheduledAt,
        appointment.visioUrl || undefined,
      );
    }

    // WhatsApp si configuré
    if (appointment.lead.phone && this.configService.get<boolean>('WHATSAPP_ENABLED')) {
      await this.whatsappService.sendAppointmentConfirmationWhatsApp(
        appointment.lead.phone,
        appointment.scheduledAt,
        closerName,
        appointment.visioUrl || undefined,
      );
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

    // Email de rappel
    await this.emailService.sendAppointmentReminder(
      appointment.lead.email,
      appointment.scheduledAt,
      closerName,
      appointment.visioUrl || undefined,
    );

    // SMS si disponible
    if (appointment.lead.phone && this.configService.get<boolean>('SMS_ENABLED')) {
      await this.smsService.sendAppointmentReminderSms(
        appointment.lead.phone,
        appointment.scheduledAt,
        appointment.visioUrl || undefined,
      );
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

    // Envoyer l'email de récupération
    await this.emailService.sendAbandonRecovery(
      abandon.email,
      abandon.form.name,
      formUrl,
      attempt,
    );

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
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'IN_APP',
        status: 'PENDING',
        title,
        message,
        metadataJson: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  /**
   * Récupère toutes les notifications d'un utilisateur
   */
  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limiter à 50 dernières notifications
    });
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
      const result = await this.emailService.sendVerificationEmail(email, verificationToken, firstName);
      if (result) {
        this.logger.log(`✅ Email de vérification envoyé à ${email}`);
      } else {
        this.logger.warn(`⚠️ Échec de l'envoi de l'email de vérification à ${email}`);
      }
      return result;
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
      
      const result = await this.emailService.sendInvitationEmail(
        email,
        inviteUrl,
        organizationName,
        firstName,
        lastName,
      );
      
      if (result) {
        this.logger.log(`✅ Email d'invitation envoyé à ${email} pour ${organizationName}`);
      } else {
        this.logger.warn(`⚠️ Échec de l'envoi de l'email d'invitation à ${email}`);
      }
      return result;
    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'envoi de l'email d'invitation à ${email}:`, error);
      return false;
    }
  }
}


