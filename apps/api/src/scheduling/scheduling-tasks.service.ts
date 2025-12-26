import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { subDays, subHours, isAfter } from 'date-fns';

@Injectable()
export class SchedulingTasksService {
  private readonly logger = new Logger(SchedulingTasksService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Tâche cron qui s'exécute toutes les heures
   * Envoie les confirmations T+0 (immédiatement après création)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleAppointmentConfirmations() {
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
  }

  /**
   * Tâche cron qui s'exécute toutes les heures
   * Envoie les rappels J-1 (24h avant le RDV)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleDayBeforeReminders() {
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
  }

  /**
   * Tâche cron qui s'exécute toutes les 15 minutes
   * Envoie les rappels H-1 (1h avant le RDV)
   */
  @Cron('*/15 * * * *') // Toutes les 15 minutes
  async handleHourBeforeReminders() {
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
  }
}




