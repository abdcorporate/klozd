import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataRetentionService } from './data-retention.service';
import { DistributedLockService } from './distributed-lock.service';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class DataRetentionTasksService {
  private readonly logger = new Logger(DataRetentionTasksService.name);

  constructor(
    private dataRetentionService: DataRetentionService,
    private lockService: DistributedLockService,
    private pinoLogger: PinoLogger,
  ) {}

  /**
   * Tâche cron qui s'exécute quotidiennement à 2h du matin
   * Purge les données selon les politiques de rétention configurées
   * TTL: 30 min (job long, purge de grandes quantités de données)
   */
  @Cron('0 2 * * *') // Tous les jours à 2h du matin
  async handleDataRetention() {
    await this.lockService.withLock('handleDataRetention', 30 * 60 * 1000, async () => {
      const startTime = Date.now();
      this.logger.log('Starting daily data retention purge job...');

      const stats = await this.dataRetentionService.runAllPurges();

      const duration = Date.now() - startTime;
      this.pinoLogger.info(
        {
          jobName: 'handleDataRetention',
          durationMs: duration,
          stats,
        },
        'Data retention job completed',
      );
    });
  }
}
