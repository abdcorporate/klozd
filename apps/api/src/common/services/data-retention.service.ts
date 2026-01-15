import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { subDays } from 'date-fns';

export interface RetentionStats {
  formAbandons: number;
  notifications: number;
  idempotencyKeys: number;
  auditLogs: number;
  total: number;
}

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);

  // Configuration par défaut (en jours)
  private readonly FORM_ABANDON_RETENTION_DAYS: number;
  private readonly NOTIFICATION_RETENTION_DAYS: number;
  private readonly AUDIT_LOG_RETENTION_DAYS: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Récupérer les valeurs depuis les variables d'environnement
    this.FORM_ABANDON_RETENTION_DAYS = parseInt(
      this.configService.get<string>('RETENTION_FORM_ABANDON_DAYS') || '90',
      10,
    );
    this.NOTIFICATION_RETENTION_DAYS = parseInt(
      this.configService.get<string>('RETENTION_NOTIFICATION_DAYS') || '180',
      10,
    );
    this.AUDIT_LOG_RETENTION_DAYS = parseInt(
      this.configService.get<string>('RETENTION_AUDIT_LOG_DAYS') || '365',
      10,
    );

    this.logger.log(
      `DataRetentionService initialized with retention policies: FormAbandon=${this.FORM_ABANDON_RETENTION_DAYS} days, Notifications=${this.NOTIFICATION_RETENTION_DAYS} days, AuditLog=${this.AUDIT_LOG_RETENTION_DAYS} days`,
    );
  }

  /**
   * Purge les FormAbandon plus anciens que la période de rétention
   */
  async purgeFormAbandons(): Promise<number> {
    const cutoffDate = subDays(new Date(), this.FORM_ABANDON_RETENTION_DAYS);

    const result = await this.prisma.formAbandon.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    const count = result.count;
    if (count > 0) {
      this.logger.log(`Purged ${count} FormAbandon records older than ${this.FORM_ABANDON_RETENTION_DAYS} days`);
    }

    return count;
  }

  /**
   * Purge les Notifications lues plus anciennes que la période de rétention
   */
  async purgeNotifications(): Promise<number> {
    const cutoffDate = subDays(new Date(), this.NOTIFICATION_RETENTION_DAYS);

    const result = await this.prisma.notification.deleteMany({
      where: {
        status: 'READ', // Uniquement les notifications lues (enum NotificationStatus)
        readAt: {
          not: null,
          lt: cutoffDate,
        },
      },
    });

    const count = result.count;
    if (count > 0) {
      this.logger.log(`Purged ${count} read Notification records older than ${this.NOTIFICATION_RETENTION_DAYS} days`);
    }

    return count;
  }

  /**
   * Purge les IdempotencyKey expirées
   */
  async purgeIdempotencyKeys(): Promise<number> {
    const now = new Date();

    const result = await this.prisma.idempotencyKey.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    const count = result.count;
    if (count > 0) {
      this.logger.log(`Purged ${count} expired IdempotencyKey records`);
    }

    return count;
  }

  /**
   * Purge les AuditLog plus anciens que la période de rétention
   */
  async purgeAuditLogs(): Promise<number> {
    const cutoffDate = subDays(new Date(), this.AUDIT_LOG_RETENTION_DAYS);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    const count = result.count;
    if (count > 0) {
      this.logger.log(`Purged ${count} AuditLog records older than ${this.AUDIT_LOG_RETENTION_DAYS} days`);
    }

    return count;
  }

  /**
   * Exécute toutes les purges et retourne les statistiques
   */
  async runAllPurges(): Promise<RetentionStats> {
    this.logger.log('Starting data retention purge job...');

    const startTime = Date.now();

    try {
      const [formAbandons, notifications, idempotencyKeys, auditLogs] = await Promise.all([
        this.purgeFormAbandons(),
        this.purgeNotifications(),
        this.purgeIdempotencyKeys(),
        this.purgeAuditLogs(),
      ]);

      const total = formAbandons + notifications + idempotencyKeys + auditLogs;
      const duration = Date.now() - startTime;

      const stats: RetentionStats = {
        formAbandons,
        notifications,
        idempotencyKeys,
        auditLogs,
        total,
      };

      this.logger.log(
        `Data retention purge completed in ${duration}ms. Stats: ${JSON.stringify(stats)}`,
      );

      return stats;
    } catch (error) {
      this.logger.error(`Error during data retention purge: ${error.message}`, error.stack);
      throw error;
    }
  }
}
