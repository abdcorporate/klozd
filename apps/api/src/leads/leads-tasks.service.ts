import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DistributedLockService } from '../common/services/distributed-lock.service';

@Injectable()
export class LeadsTasksService {
  private readonly logger = new Logger(LeadsTasksService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private lockService: DistributedLockService,
    private pinoLogger: PinoLogger,
  ) {}

  /**
   * Tâche cron qui s'exécute toutes les heures
   * Envoie la séquence de récupération d'abandons (J+1, J+3)
   * Max 3 emails sur 7 jours
   * TTL: 5 min (job rapide, traitement par batch)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleAbandonRecovery() {
    await this.lockService.withLock('handleAbandonRecovery', 5 * 60 * 1000, async () => {
      const startTime = Date.now();
      this.logger.log('Vérification des abandons à récupérer...');

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // J+1 : Abandons créés il y a 1 jour, premier email (recoveryEmailsSent = 0)
      const abandonsJ1 = await this.prisma.formAbandon.findMany({
        where: {
          recovered: false,
          recoveryEmailsSent: 0, // Premier email
          email: { not: null }, // Uniquement ceux avec email
          createdAt: {
            gte: oneDayAgo,
            lte: new Date(oneDayAgo.getTime() + 2 * 60 * 60 * 1000), // Fenêtre de 2h
          },
        },
        include: {
          form: true,
        },
      });

      // J+3 : Abandons créés il y a 3 jours, deuxième email (recoveryEmailsSent = 1)
      const abandonsJ3 = await this.prisma.formAbandon.findMany({
        where: {
          recovered: false,
          recoveryEmailsSent: 1, // Deuxième email
          email: { not: null },
          createdAt: {
            gte: threeDaysAgo,
            lte: new Date(threeDaysAgo.getTime() + 2 * 60 * 60 * 1000), // Fenêtre de 2h
          },
          lastRecoveryEmailAt: {
            lte: threeDaysAgo, // Au moins 2 jours depuis le dernier email
          },
        },
        include: {
          form: true,
        },
      });

      // Vérifier qu'on ne dépasse pas 3 emails sur 7 jours
      const allAbandons = [...abandonsJ1, ...abandonsJ3];
      const abandonsToProcess = allAbandons.filter(abandon => {
        // Ne pas envoyer si déjà 3 emails envoyés
        if (abandon.recoveryEmailsSent >= 3) {
          return false;
        }
        
        // Ne pas envoyer si l'abandon a plus de 7 jours
        if (abandon.createdAt < sevenDaysAgo) {
          return false;
        }

        return true;
      });

      // Envoyer les emails de récupération
      let sentCount = 0;

      for (const abandon of abandonsToProcess) {
        if (!abandon.email) continue;

        try {
          await this.notificationsService.sendAbandonRecovery(abandon.id);
          sentCount++;
          this.logger.log(`Email de récupération envoyé pour l'abandon ${abandon.id} (tentative ${abandon.recoveryEmailsSent + 1})`);
        } catch (error) {
          this.logger.error(
            `Erreur lors de l'envoi de récupération pour l'abandon ${abandon.id}:`,
            error,
          );
        }
      }

      this.logger.log(`${sentCount} email(s) de récupération envoyé(s)`);

      const duration = Date.now() - startTime;
      this.pinoLogger.info(
        {
          jobName: 'handleAbandonRecovery',
          durationMs: duration,
          itemsProcessed: sentCount,
        },
        'Cron job completed',
      );
    });
  }
}




