import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DistributedLockService } from '../common/services/distributed-lock.service';
import { isSchedulerEnabled } from '../common/utils/scheduler.utils';
import { subDays, subHours, isAfter } from 'date-fns';

@Injectable()
export class SchedulingTasksService {
  private readonly logger = new Logger(SchedulingTasksService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private lockService: DistributedLockService,
    private pinoLogger: PinoLogger,
  ) {}

  /**
   * Tâche cron qui s'exécute toutes les heures
   * Envoie les confirmations T+0 (immédiatement après création)
   * TTL: 5 min (job rapide, traitement par batch)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleAppointmentConfirmations() {
    if (!isSchedulerEnabled()) {
      return;
    }
    await this.lockService.withLock('handleAppointmentConfirmations', 5 * 60 * 1000, async () => {
      const startTime = Date.now();
      this.logger.log('Vérification des confirmations de RDV à envoyer...');

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Trouver les appointments créés dans la dernière heure qui n'ont pas encore reçu de confirmation
      const appointmentsToConfirm = await this.prisma.appointment.findMany({
        where: {
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
          confirmationSent: false,
          createdAt: {
            gte: oneHourAgo,
            lte: now,
          },
        },
        include: {
          lead: true,
          assignedCloser: true,
        },
      });

      for (const appointment of appointmentsToConfirm) {
        try {
          await this.notificationsService.sendAppointmentConfirmation(appointment.id);
          this.logger.log(`Confirmation T+0 envoyée pour l'appointment ${appointment.id}`);
        } catch (error) {
          this.logger.error(
            `Erreur lors de l'envoi de la confirmation pour l'appointment ${appointment.id}:`,
            error,
          );
        }
      }

      this.logger.log(`${appointmentsToConfirm.length} confirmation(s) envoyée(s)`);

      // Programmer WhatsApp T+10min pour les appointments confirmés
      for (const appointment of appointmentsToConfirm) {
        if (appointment.lead.phone) {
          // Programmer l'envoi WhatsApp dans 10 minutes
          setTimeout(async () => {
            try {
              await this.sendWhatsAppT10(appointment.id);
            } catch (error) {
              this.logger.error(
                `Erreur lors de l'envoi WhatsApp T+10min pour l'appointment ${appointment.id}:`,
                error,
              );
            }
          }, 10 * 60 * 1000); // 10 minutes
        }
      }

      const duration = Date.now() - startTime;
      this.pinoLogger.info(
        {
          jobName: 'handleAppointmentConfirmations',
          durationMs: duration,
          itemsProcessed: appointmentsToConfirm.length,
        },
        'Cron job completed',
      );
    });
  }

  /**
   * Envoie un WhatsApp personnalisé T+10min après la réservation
   */
  async sendWhatsAppT10(appointmentId: string): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        lead: true,
        assignedCloser: {
          include: {
            closerSettings: {
              select: {
                pseudonyme: true,
              },
            },
          },
        },
      },
    });

    if (!appointment || !appointment.lead.phone) {
      return;
    }

    const closerName = appointment.assignedCloser.closerSettings?.pseudonyme 
      || `${appointment.assignedCloser.firstName} ${appointment.assignedCloser.lastName}`;
    const leadFirstName = appointment.lead.firstName || 'Bonjour';
    const dateStr = appointment.scheduledAt.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    const message = `Bonjour ${leadFirstName}, c'est ${closerName}. J'ai hâte de vous parler le ${dateStr} 🎯`;

    await this.notificationsService.sendWhatsAppMessage(appointment.lead.phone, message);
    this.logger.log(`WhatsApp T+10min envoyé pour l'appointment ${appointmentId}`);
  }

  /**
   * Tâche cron qui s'exécute toutes les heures
   * Envoie les rappels J-1 (24h avant le RDV)
   * TTL: 5 min (job rapide, traitement par batch)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleDayBeforeReminders() {
    if (!isSchedulerEnabled()) {
      return;
    }
    await this.lockService.withLock('handleDayBeforeReminders', 5 * 60 * 1000, async () => {
      const startTime = Date.now();
      this.logger.log('Vérification des rappels J-1 à envoyer...');

      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(23, 59, 59, 999);

      // Trouver les appointments demain qui n'ont pas encore reçu de rappel J-1
      const appointmentsToRemind = await this.prisma.appointment.findMany({
        where: {
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
          scheduledAt: {
            gte: tomorrow,
            lte: tomorrowEnd,
          },
          reminderSent: false,
          confirmationSent: true, // Seulement si la confirmation initiale a été envoyée
        },
        include: {
          lead: true,
          assignedCloser: true,
        },
      });

      for (const appointment of appointmentsToRemind) {
        try {
          await this.notificationsService.sendAppointmentReminder(appointment.id, 'day');
          this.logger.log(`Rappel J-1 envoyé pour l'appointment ${appointment.id}`);
        } catch (error) {
          this.logger.error(
            `Erreur lors de l'envoi du rappel J-1 pour l'appointment ${appointment.id}:`,
            error,
          );
        }
      }

      this.logger.log(`${appointmentsToRemind.length} rappel(s) J-1 envoyé(s)`);

      const duration = Date.now() - startTime;
      this.pinoLogger.info(
        {
          jobName: 'handleDayBeforeReminders',
          durationMs: duration,
          itemsProcessed: appointmentsToRemind.length,
        },
        'Cron job completed',
      );
    });
  }

  /**
   * Tâche cron qui s'exécute toutes les 15 minutes
   * Envoie les rappels H-1 (1h avant le RDV)
   * TTL: 3 min (job rapide, exécuté fréquemment)
   */
  @Cron('*/15 * * * *') // Toutes les 15 minutes
  async handleHourBeforeReminders() {
    if (!isSchedulerEnabled()) {
      return;
    }
    await this.lockService.withLock('handleHourBeforeReminders', 3 * 60 * 1000, async () => {
      const startTime = Date.now();
      this.logger.log('Vérification des rappels H-1 à envoyer...');

      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const oneHourFromNowEnd = new Date(oneHourFromNow.getTime() + 15 * 60 * 1000); // Fenêtre de 15 min

      // Trouver les appointments dans 1h qui n'ont pas encore reçu de rappel H-1
      const appointmentsToRemind = await this.prisma.appointment.findMany({
        where: {
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
          scheduledAt: {
            gte: oneHourFromNow,
            lte: oneHourFromNowEnd,
          },
          reminderSent: true, // Doit avoir reçu le rappel J-1
          lastReminderAt: {
            not: null, // A déjà reçu un rappel
          },
        },
        include: {
          lead: true,
          assignedCloser: true,
        },
      });

      // Filtrer ceux qui n'ont pas encore reçu de rappel H-1
      // (on vérifie que le dernier rappel était il y a plus de 12h, donc c'était le J-1)
      const appointmentsForHourReminder = appointmentsToRemind.filter((apt) => {
        if (!apt.lastReminderAt) return false;
        const hoursSinceLastReminder =
          (now.getTime() - apt.lastReminderAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceLastReminder >= 12; // Le rappel J-1 était il y a au moins 12h
      });

      for (const appointment of appointmentsForHourReminder) {
        try {
          await this.notificationsService.sendAppointmentReminder(appointment.id, 'hour');
          this.logger.log(`Rappel H-1 envoyé pour l'appointment ${appointment.id}`);
        } catch (error) {
          this.logger.error(
            `Erreur lors de l'envoi du rappel H-1 pour l'appointment ${appointment.id}:`,
            error,
          );
        }
      }

      this.logger.log(`${appointmentsForHourReminder.length} rappel(s) H-1 envoyé(s)`);

      const duration = Date.now() - startTime;
      this.pinoLogger.info(
        {
          jobName: 'handleHourBeforeReminders',
          durationMs: duration,
          itemsProcessed: appointmentsForHourReminder.length,
        },
        'Cron job completed',
      );
    });
  }

  /**
   * Tâche cron qui s'exécute toutes les 15 minutes
   * Envoie les notifications T-0 (à l'heure du RDV) pour les closeuses
   * TTL: 3 min (job rapide, exécuté fréquemment)
   */
  @Cron('*/15 * * * *') // Toutes les 15 minutes
  async handleAppointmentStartNotifications() {
    if (!isSchedulerEnabled()) {
      return;
    }
    await this.lockService.withLock('handleAppointmentStartNotifications', 3 * 60 * 1000, async () => {
      const startTime = Date.now();
      this.logger.log('Vérification des notifications T-0 à envoyer...');

      const now = new Date();
      const windowStart = new Date(now.getTime() - 15 * 60 * 1000); // 15 min avant
      const windowEnd = new Date(now.getTime() + 15 * 60 * 1000); // 15 min après

      // Trouver les appointments qui commencent maintenant
      const startingAppointments = await this.prisma.appointment.findMany({
        where: {
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
          scheduledAt: {
            gte: windowStart,
            lte: windowEnd,
          },
        },
        include: {
          lead: true,
          assignedCloser: true,
        },
      });

      for (const appointment of startingAppointments) {
        try {
          // Créer une notification in-app pour la closeuse
          await this.prisma.notification.create({
            data: {
              userId: appointment.assignedCloserId,
              type: 'IN_APP',
              status: 'SENT',
              title: '🔔 RDV commence !',
              message: `Votre rendez-vous avec ${appointment.lead.firstName || appointment.lead.email} commence maintenant`,
              metadataJson: JSON.stringify({
                appointmentId: appointment.id,
                leadId: appointment.leadId,
                type: 'appointment_start',
              }),
            },
          });

          this.logger.log(`Notification T-0 envoyée pour l'appointment ${appointment.id}`);
        } catch (error) {
          this.logger.error(
            `Erreur lors de l'envoi de la notification T-0 pour l'appointment ${appointment.id}:`,
            error,
          );
        }
      }

      this.logger.log(`${startingAppointments.length} notification(s) T-0 envoyée(s)`);

      const duration = Date.now() - startTime;
      this.pinoLogger.info(
        {
          jobName: 'handleAppointmentStartNotifications',
          durationMs: duration,
          itemsProcessed: startingAppointments.length,
        },
        'Cron job completed',
      );
    });
  }

  /**
   * Tâche cron qui s'exécute toutes les 15 minutes
   * Détecte les no-shows (prospect pas connecté 15min après le début)
   * TTL: 3 min (job rapide, exécuté fréquemment)
   */
  @Cron('*/15 * * * *') // Toutes les 15 minutes
  async handleNoShowDetection() {
    if (!isSchedulerEnabled()) {
      return;
    }
    await this.lockService.withLock('handleNoShowDetection', 3 * 60 * 1000, async () => {
      const startTime = Date.now();
      this.logger.log('Vérification des no-shows potentiels...');

      const now = new Date();
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

      // Trouver les appointments qui ont commencé il y a 15-30 minutes et qui n'ont pas de call associé
      const potentialNoShows = await this.prisma.appointment.findMany({
        where: {
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
          scheduledAt: {
            gte: thirtyMinutesAgo,
            lte: fifteenMinutesAgo,
          },
          call: null, // Pas de call = prospect pas connecté
        },
        include: {
          lead: true,
          assignedCloser: true,
          call: true,
        },
      });

      for (const appointment of potentialNoShows) {
        try {
          // Créer une notification pour la closeuse avec option de marquer comme no-show
          await this.prisma.notification.create({
            data: {
              userId: appointment.assignedCloserId,
              type: 'IN_APP',
              status: 'SENT',
              title: '📞 Prospect non connecté',
              message: `Le prospect ${appointment.lead.firstName || appointment.lead.email} n'est pas venu. Marquer comme NO-SHOW ?`,
              metadataJson: JSON.stringify({
                appointmentId: appointment.id,
                leadId: appointment.leadId,
                type: 'no_show_detection',
                actionUrl: `/scheduling/appointments/${appointment.id}/no-show`,
              }),
            },
          });

          this.logger.log(`No-show détecté pour l'appointment ${appointment.id}`);
        } catch (error) {
          this.logger.error(
            `Erreur lors de la détection de no-show pour l'appointment ${appointment.id}:`,
            error,
          );
        }
      }

      this.logger.log(`${potentialNoShows.length} no-show(s) détecté(s)`);

      const duration = Date.now() - startTime;
      this.pinoLogger.info(
        {
          jobName: 'handleNoShowDetection',
          durationMs: duration,
          itemsProcessed: potentialNoShows.length,
        },
        'Cron job completed',
      );
    });
  }

  /**
   * Tâche cron qui s'exécute tous les jours à 9h
   * Envoie les emails de relance J+2 pour les no-shows
   * TTL: 5 min (job rapide, traitement par batch)
   */
  @Cron('0 9 * * *') // Tous les jours à 9h
  async handleNoShowRecoveryEmails() {
    if (!isSchedulerEnabled()) {
      return;
    }
    await this.lockService.withLock('handleNoShowRecoveryEmails', 5 * 60 * 1000, async () => {
      const startTime = Date.now();
      this.logger.log('Vérification des emails de relance no-show J+2...');

      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const twoDaysAgoStart = new Date(twoDaysAgo.setHours(0, 0, 0, 0));
      const twoDaysAgoEnd = new Date(twoDaysAgo.setHours(23, 59, 59, 999));

      // Trouver les appointments marqués NO_SHOW il y a 2 jours
      const noShowAppointments = await this.prisma.appointment.findMany({
        where: {
          status: 'NO_SHOW',
          updatedAt: {
            gte: twoDaysAgoStart,
            lte: twoDaysAgoEnd,
          },
        },
        include: {
          lead: true,
        },
      });

      for (const appointment of noShowAppointments) {
        try {
          // Vérifier si le lead n'est pas blacklisté
          if (appointment.lead.status === 'DISQUALIFIED' && 
              appointment.lead.disqualificationReason?.includes('blacklisté')) {
            continue; // Skip les leads blacklistés
          }

          // Envoyer l'email J+2
          await this.notificationsService.sendNoShowRecoveryEmail(appointment.id, 2);
          this.logger.log(`Email J+2 envoyé pour l'appointment ${appointment.id}`);
        } catch (error) {
          this.logger.error(
            `Erreur lors de l'envoi de l'email J+2 pour l'appointment ${appointment.id}:`,
            error,
          );
        }
      }

      this.logger.log(`${noShowAppointments.length} email(s) de relance J+2 envoyé(s)`);

      const duration = Date.now() - startTime;
      this.pinoLogger.info(
        {
          jobName: 'handleNoShowRecoveryEmails',
          durationMs: duration,
          itemsProcessed: noShowAppointments.length,
        },
        'Cron job completed',
      );
    });
  }

  /**
   * Tâche cron qui s'exécute tous les lundis à 9h
   * Envoie une notification admin avec le taux de no-show de la semaine précédente
   * TTL: 10 min (job plus long, traitement de toutes les organisations)
   */
  @Cron('0 9 * * 1') // Tous les lundis à 9h
  async handleNoShowRateNotification() {
    if (!isSchedulerEnabled()) {
      return;
    }
    await this.lockService.withLock('handleNoShowRateNotification', 10 * 60 * 1000, async () => {
      const startTime = Date.now();
      this.logger.log('Calcul du taux de no-show hebdomadaire...');

      const now = new Date();
      const lastWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      lastWeekStart.setHours(0, 0, 0, 0);
      const lastWeekEnd = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      lastWeekEnd.setHours(23, 59, 59, 999);

      // Récupérer toutes les organisations
      const organizations = await this.prisma.organization.findMany({
        include: {
          users: {
            where: {
              role: { in: ['ADMIN', 'SUPER_ADMIN'] },
            },
          },
        },
      });

      for (const org of organizations) {
        try {
          // Récupérer les leads de l'organisation
          const orgLeads = await this.prisma.lead.findMany({
            where: { organizationId: org.id },
            select: { id: true },
          });
          const leadIds = orgLeads.map((l) => l.id);

          // Compter les appointments de la semaine dernière
          const totalAppointments = await this.prisma.appointment.count({
            where: {
              leadId: { in: leadIds },
              scheduledAt: {
                gte: lastWeekStart,
                lte: lastWeekEnd,
              },
              status: { in: ['COMPLETED', 'NO_SHOW', 'CANCELLED'] },
            },
          });

          // Compter les no-shows
          const noShows = await this.prisma.appointment.count({
            where: {
              leadId: { in: leadIds },
              scheduledAt: {
                gte: lastWeekStart,
                lte: lastWeekEnd,
              },
              status: 'NO_SHOW',
            },
          });

          // Calculer le taux
          const noShowRate = totalAppointments > 0 ? ((noShows / totalAppointments) * 100) : 0;

          // Envoyer une notification aux admins de l'organisation
          for (const admin of org.users) {
            await this.prisma.notification.create({
              data: {
                userId: admin.id,
                type: 'IN_APP',
                status: 'SENT',
                title: '📊 Taux de no-show hebdomadaire',
                message: `Taux de no-show cette semaine : ${Math.round(noShowRate)}% (${noShows}/${totalAppointments} rendez-vous)`,
                metadataJson: JSON.stringify({
                  type: 'no_show_rate',
                  organizationId: org.id,
                  noShowRate: Math.round(noShowRate),
                  noShows,
                  totalAppointments,
                  period: {
                    start: lastWeekStart.toISOString(),
                    end: lastWeekEnd.toISOString(),
                  },
                }),
              },
            });
          }

          this.logger.log(
            `Notification no-show rate envoyée pour l'organisation ${org.id}: ${Math.round(noShowRate)}%`,
          );
        } catch (error) {
          this.logger.error(
            `Erreur lors de l'envoi de la notification no-show rate pour l'organisation ${org.id}:`,
            error,
          );
        }
      }

      this.logger.log('Notifications no-show rate envoyées');

      const duration = Date.now() - startTime;
      this.pinoLogger.info(
        {
          jobName: 'handleNoShowRateNotification',
          durationMs: duration,
          organizationsProcessed: organizations.length,
        },
        'Cron job completed',
      );
    });
  }
}




