import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, QueueOptions, JobsOptions } from 'bullmq';
import Redis from 'ioredis';
import { QUEUE_NAMES, QueueName } from './queue.constants';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly queues = new Map<QueueName, Queue>();
  private redis: Redis | null = null;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    this.enabled = this.configService.get<string>('QUEUE_ENABLED') === 'true';

    if (!this.enabled) {
      this.logger.warn('⚠️ Queue désactivée (QUEUE_ENABLED=false). Les jobs seront exécutés de manière synchrone.');
      return;
    }

    // Initialiser Redis
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const redisPort = parseInt(this.configService.get<string>('REDIS_PORT') || '6379', 10);
    const redisTls = this.configService.get<string>('REDIS_TLS') === 'true';

    try {
      if (redisUrl) {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        });
      } else {
        this.redis = new Redis({
          host: redisHost,
          port: redisPort,
          tls: redisTls ? {} : undefined,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        });
      }

      this.redis.on('error', (error) => {
        this.logger.error('❌ Erreur Redis:', error);
      });

      this.redis.on('connect', () => {
        this.logger.log('✅ Redis connecté');
      });

      this.logger.log(`✅ Queue activée avec Redis (${redisUrl || `${redisHost}:${redisPort}`})`);
    } catch (error) {
      this.logger.error('❌ Erreur lors de l\'initialisation de Redis:', error);
      this.logger.warn('⚠️ Les jobs seront exécutés de manière synchrone.');
    }
  }

  /**
   * Récupère ou crée une queue
   */
  getQueue(name: QueueName): Queue | null {
    if (!this.enabled || !this.redis) {
      return null;
    }

    if (this.queues.has(name)) {
      return this.queues.get(name)!;
    }

    const queueOptions: QueueOptions = {
      connection: this.redis,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 30000, // 30 secondes
        },
        removeOnComplete: true,
        removeOnFail: false, // Garder les jobs échoués pour le DLQ
      },
    };

    const queue = new Queue(name, queueOptions);
    this.queues.set(name, queue);

    this.logger.log(`✅ Queue "${name}" créée`);

    return queue;
  }

  /**
   * Ajoute un job à une queue
   * Si la queue est désactivée, retourne null
   */
  async addJob<T = any>(
    queueName: QueueName,
    jobName: string,
    data: T,
    options?: JobsOptions,
  ): Promise<string | null> {
    if (!this.enabled || !this.redis) {
      this.logger.debug(`Job "${jobName}" ignoré (queue désactivée)`);
      return null;
    }

    const queue = this.getQueue(queueName);
    if (!queue) {
      this.logger.warn(`Queue "${queueName}" non disponible`);
      return null;
    }

    try {
      const job = await queue.add(jobName, data, options);
      this.logger.debug(`Job "${jobName}" ajouté à la queue "${queueName}" (ID: ${job.id})`);
      return job.id!;
    } catch (error) {
      this.logger.error(`Erreur lors de l'ajout du job "${jobName}" à la queue "${queueName}":`, error);
      return null;
    }
  }

  /**
   * Nettoie les ressources lors de la destruction du module
   */
  async onModuleDestroy() {
    this.logger.log('Fermeture des queues...');

    for (const [name, queue] of this.queues.entries()) {
      try {
        await queue.close();
        this.logger.log(`Queue "${name}" fermée`);
      } catch (error) {
        this.logger.error(`Erreur lors de la fermeture de la queue "${name}":`, error);
      }
    }

    if (this.redis) {
      try {
        await this.redis.quit();
        this.logger.log('Redis déconnecté');
      } catch (error) {
        this.logger.error('Erreur lors de la déconnexion de Redis:', error);
      }
    }
  }

  /**
   * Vérifie si la queue est activée
   */
  isEnabled(): boolean {
    return this.enabled && this.redis !== null;
  }
}
