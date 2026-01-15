import { PinoLogger } from 'nestjs-pino';
import { DistributedLockService, LockResult } from './distributed-lock.service';

export interface CronJobOptions {
  jobName: string;
  ttlMs: number; // TTL en millisecondes (doit être > worst-case runtime)
}

/**
 * Wrapper helper pour exécuter un job cron avec un lock distribué
 * Usage:
 * ```typescript
 * const result = await this.cronJobWrapper.execute(
 *   { jobName: 'handleAppointmentConfirmations', ttlMs: 5 * 60 * 1000 },
 *   async (lockResult) => {
 *     // Votre logique de job ici
 *     const itemsProcessed = await this.processItems();
 *     return { itemsProcessed };
 *   },
 * );
 * ```
 */
export class CronJobWrapper {
  constructor(
    private lockService: DistributedLockService,
    private pinoLogger: PinoLogger,
  ) {}

  async execute<T>(
    options: CronJobOptions,
    jobFn: (lockResult: LockResult) => Promise<T>,
  ): Promise<{ executed: boolean; result?: T; itemsProcessed?: number }> {
    const { jobName, ttlMs } = options;
    const startTime = Date.now();

    // Tenter d'acquérir le lock
    const lockResult = await this.lockService.tryAcquireLock(jobName, ttlMs);

    if (!lockResult.acquired) {
      this.pinoLogger.info(
        {
          jobName,
          acquired: false,
          durationMs: Date.now() - startTime,
        },
        `Cron job "${jobName}" skipped (lock not acquired)`,
      );
      return { executed: false };
    }

    // Lock acquis, exécuter le job
    try {
      const result = await jobFn(lockResult);
      const duration = Date.now() - startTime;

      // Extraire itemsProcessed si disponible
      const itemsProcessed = (result as any)?.itemsProcessed || undefined;

      this.pinoLogger.info(
        {
          jobName,
          acquired: true,
          durationMs: duration,
          itemsProcessed,
        },
        `Cron job "${jobName}" completed successfully`,
      );

      return { executed: true, result, itemsProcessed };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.pinoLogger.error(
        {
          jobName,
          acquired: true,
          durationMs: duration,
          error: error instanceof Error ? error.message : String(error),
        },
        `Cron job "${jobName}" failed`,
      );

      throw error;
    } finally {
      // Optionnel: libérer le lock avant l'expiration si le job se termine plus tôt
      // Le TTL libérera le lock de toute façon, mais c'est une bonne pratique
      await this.lockService.releaseLock(lockResult.lockKey);
    }
  }
}
