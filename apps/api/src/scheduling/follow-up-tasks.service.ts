import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FollowUpTasksService {
  private readonly logger = new Logger(FollowUpTasksService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Tâche cron qui s'exécute toutes les heures
   * Crée des activités de follow-up automatiques après les appels
   * DÉSACTIVÉ : Module Activities supprimé
   */
  // @Cron(CronExpression.EVERY_HOUR)
  async handleAutoFollowUps() {
    // Module Activities supprimé - cette fonctionnalité est désactivée
    this.logger.log('Follow-ups automatiques désactivés (module Activities supprimé)');
    return;
  }

  /**
   * Tâche cron qui s'exécute toutes les heures
   * Envoie des rappels pour les follow-ups en retard
   * DÉSACTIVÉ : Module Activities supprimé
   */
  // @Cron(CronExpression.EVERY_HOUR)
  async handleOverdueFollowUps() {
    // Module Activities supprimé - cette fonctionnalité est désactivée
    this.logger.log('Rappels de follow-ups désactivés (module Activities supprimé)');
    return;
  }
}

