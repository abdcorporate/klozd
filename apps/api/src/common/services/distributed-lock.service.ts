import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PinoLogger } from 'nestjs-pino';

export interface LockResult {
  acquired: boolean;
  lockKey: string;
}

@Injectable()
export class DistributedLockService implements OnModuleDestroy {
  private readonly logger: Logger;
  private redis: Redis | null = null;
  private readonly enabled: boolean;
  private readonly fallbackMode: 'disable' | 'single-instance';
  private readonly keyPrefix = 'locks:klozd:';

  constructor(
    private configService: ConfigService,
    private pinoLogger: PinoLogger,
  ) {
    this.logger = new Logger(DistributedLockService.name);
    this.enabled = this.configService.get<string>('REDIS_ENABLED') !== 'false';
    // DISABLE_CRONS_ON_REDIS_DOWN=true signifie fallback=disable (ne pas exécuter si Redis down)
    // DISABLE_CRONS_ON_REDIS_DOWN=false ou non défini signifie fallback=single-instance (exécuter même si Redis down)
    const disableOnRedisDown = this.configService.get<string>('DISABLE_CRONS_ON_REDIS_DOWN') === 'true';
    this.fallbackMode = disableOnRedisDown ? 'disable' : 'single-instance';

    if (!this.enabled) {
      this.logger.warn('⚠️ Distributed lock désactivé (REDIS_ENABLED=false). Les crons s\'exécuteront sans lock.');
      return;
    }

    this.initializeRedis();
  }

  private initializeRedis(): void {
    try {
      const redisUrl = this.configService.get<string>('REDIS_URL');
      const redisHost = this.configService.get<string>('REDIS_HOST') || 'localhost';
      const redisPort = parseInt(this.configService.get<string>('REDIS_PORT') || '6379', 10);
      const redisTls = this.configService.get<string>('REDIS_TLS') === 'true';

      if (redisUrl) {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          retryStrategy: (times) => {
            // Arrêter après 3 tentatives
            if (times > 3) {
              this.logger.error('❌ Redis: Trop de tentatives de reconnexion, passage en mode fallback');
              return null;
            }
            return Math.min(times * 200, 2000);
          },
        });
      } else {
        this.redis = new Redis({
          host: redisHost,
          port: redisPort,
          tls: redisTls ? {} : undefined,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          retryStrategy: (times) => {
            if (times > 3) {
              this.logger.error('❌ Redis: Trop de tentatives de reconnexion, passage en mode fallback');
              return null;
            }
            return Math.min(times * 200, 2000);
          },
        });
      }

      this.redis.on('error', (error) => {
        this.logger.error('❌ Erreur Redis:', error);
        // Ne pas fermer la connexion, on continue en mode fallback
      });

      this.redis.on('connect', () => {
        this.logger.log('✅ Redis connecté pour distributed locks');
      });

      this.redis.on('ready', () => {
        this.logger.log('✅ Redis prêt pour distributed locks');
      });

      this.redis.on('close', () => {
        this.logger.warn('⚠️ Redis déconnecté, passage en mode fallback');
      });
    } catch (error) {
      this.logger.error('❌ Erreur lors de l\'initialisation de Redis:', error);
      this.redis = null;
    }
  }

  /**
   * Tente d'acquérir un lock distribué
   * @param jobName Nom unique du job (ex: 'handleAppointmentConfirmations')
   * @param ttlMs TTL en millisecondes (doit être supérieur au worst-case runtime)
   * @returns LockResult avec acquired=true si le lock a été acquis, false sinon
   */
  async acquire(lockKey: string, ttlMs: number): Promise<boolean> {
    const fullLockKey = `${this.keyPrefix}${lockKey}`;
    const startTime = Date.now();

    // Si Redis n'est pas disponible
    if (!this.redis || !this.isRedisAvailable()) {
      if (this.fallbackMode === 'disable') {
        this.pinoLogger.warn(
          {
            lockKey: fullLockKey,
            acquired: false,
            reason: 'redis_unavailable',
            fallbackMode: 'disable',
            ttlMs,
            durationMs: Date.now() - startTime,
          },
          `⚠️ Redis indisponible, lock "${lockKey}" refusé (fallback=disable)`,
        );
        return false;
      } else {
        // Mode single-instance : autoriser l'exécution (risque de doublons en scaling horizontal)
        this.pinoLogger.warn(
          {
            lockKey: fullLockKey,
            acquired: true,
            reason: 'redis_unavailable',
            fallbackMode: 'single-instance',
            ttlMs,
            durationMs: Date.now() - startTime,
          },
          `⚠️ Redis indisponible, lock "${lockKey}" accordé en mode single-instance (risque de doublons)`,
        );
        return true;
      }
    }

    try {
      // Utiliser SET avec NX (set if not exists) et PX (expiration en millisecondes)
      // Format: SET key value NX PX milliseconds
      const result = await this.redis.set(fullLockKey, 'locked', 'PX', ttlMs, 'NX');

      const acquired = result === 'OK';
      const duration = Date.now() - startTime;

      this.pinoLogger.info(
        {
          lockKey: fullLockKey,
          acquired,
          ttlMs,
          durationMs: duration,
        },
        `Lock ${acquired ? 'acquired' : 'rejected'} for "${lockKey}"`,
      );

      return acquired;
    } catch (error) {
      this.logger.error(`Erreur lors de l'acquisition du lock pour "${lockKey}":`, error);

      // En cas d'erreur, appliquer le fallback
      if (this.fallbackMode === 'disable') {
        this.pinoLogger.warn(
          {
            lockKey: fullLockKey,
            acquired: false,
            reason: 'redis_error',
            error: error instanceof Error ? error.message : String(error),
            fallbackMode: 'disable',
            ttlMs,
            durationMs: Date.now() - startTime,
          },
          `⚠️ Erreur Redis, lock "${lockKey}" refusé (fallback=disable)`,
        );
        return false;
      } else {
        this.pinoLogger.warn(
          {
            lockKey: fullLockKey,
            acquired: true,
            reason: 'redis_error',
            error: error instanceof Error ? error.message : String(error),
            fallbackMode: 'single-instance',
            ttlMs,
            durationMs: Date.now() - startTime,
          },
          `⚠️ Erreur Redis, lock "${lockKey}" accordé en mode single-instance (risque de doublons)`,
        );
        return true;
      }
    }
  }

  /**
   * Tente d'acquérir un lock distribué (méthode de compatibilité)
   * @param jobName Nom unique du job (ex: 'handleAppointmentConfirmations')
   * @param ttlMs TTL en millisecondes (doit être supérieur au worst-case runtime)
   * @returns LockResult avec acquired=true si le lock a été acquis, false sinon
   * @deprecated Utiliser acquire() et withLock() à la place
   */
  async tryAcquireLock(jobName: string, ttlMs: number): Promise<LockResult> {
    const acquired = await this.acquire(jobName, ttlMs);
    return { acquired, lockKey: `${this.keyPrefix}${jobName}` };
  }

  /**
   * Libère un lock (optionnel, car le TTL le libère automatiquement)
   * Utile pour libérer le lock avant l'expiration si le job se termine plus tôt
   * @param lockKey Clé du lock (sans préfixe, sera ajouté automatiquement)
   */
  async release(lockKey: string): Promise<void> {
    const fullLockKey = `${this.keyPrefix}${lockKey}`;
    if (!this.redis || !this.isRedisAvailable()) {
      return;
    }

    try {
      await this.redis.del(fullLockKey);
      this.pinoLogger.debug({ lockKey: fullLockKey }, 'Lock released');
    } catch (error) {
      this.logger.error(`Erreur lors de la libération du lock "${lockKey}":`, error);
      // Ne pas throw, le TTL libérera le lock de toute façon
    }
  }

  /**
   * Libère un lock (méthode de compatibilité)
   * @param lockKey Clé complète du lock (avec préfixe)
   * @deprecated Utiliser release() avec la clé sans préfixe à la place
   */
  async releaseLock(lockKey: string): Promise<void> {
    // Si la clé contient déjà le préfixe, l'enlever
    const keyWithoutPrefix = lockKey.startsWith(this.keyPrefix)
      ? lockKey.substring(this.keyPrefix.length)
      : lockKey;
    await this.release(keyWithoutPrefix);
  }

  /**
   * Exécute une fonction si le lock est acquis, sinon log un avertissement
   * @param lockKey Clé du lock (sans préfixe)
   * @param ttlMs TTL en millisecondes
   * @param fn Fonction à exécuter si le lock est acquis
   * @returns Résultat de la fonction si exécutée, undefined sinon
   */
  async withLock<T>(
    lockKey: string,
    ttlMs: number,
    fn: () => Promise<T>,
  ): Promise<T | undefined> {
    const startTime = Date.now();
    const acquired = await this.acquire(lockKey, ttlMs);

    if (!acquired) {
      this.pinoLogger.warn(
        {
          lockKey: `${this.keyPrefix}${lockKey}`,
          acquired: false,
          ttlMs,
          durationMs: Date.now() - startTime,
        },
        `Lock not acquired for "${lockKey}", skipping execution`,
      );
      return undefined;
    }

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.pinoLogger.info(
        {
          lockKey: `${this.keyPrefix}${lockKey}`,
          acquired: true,
          ttlMs,
          durationMs: duration,
        },
        `Lock acquired and function executed for "${lockKey}"`,
      );
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.pinoLogger.error(
        {
          lockKey: `${this.keyPrefix}${lockKey}`,
          acquired: true,
          ttlMs,
          durationMs: duration,
          error: error instanceof Error ? error.message : String(error),
        },
        `Error executing function with lock "${lockKey}"`,
      );
      throw error;
    } finally {
      // Libérer le lock avant l'expiration si possible
      await this.release(lockKey);
    }
  }

  /**
   * Vérifie si Redis est disponible et connecté
   */
  private isRedisAvailable(): boolean {
    if (!this.redis) {
      return false;
    }

    // Vérifier le statut de la connexion
    return this.redis.status === 'ready' || this.redis.status === 'connect';
  }

  /**
   * Vérifie si le service est opérationnel
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Vérifie si Redis est disponible
   */
  isRedisConnected(): boolean {
    return this.isRedisAvailable();
  }

  async onModuleDestroy() {
    if (this.redis) {
      try {
        await this.redis.quit();
        this.logger.log('Redis déconnecté (distributed lock)');
      } catch (error) {
        this.logger.error('Erreur lors de la déconnexion de Redis:', error);
      }
    }
  }
}
