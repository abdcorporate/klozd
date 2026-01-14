import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import Redis from 'ioredis';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private redis: Redis | null = null;

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
    private configService: ConfigService,
  ) {
    // Initialiser Redis si la queue est activée
    if (this.queueService.isEnabled()) {
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
      } catch (error) {
        this.logger.warn('Redis non disponible pour health check');
      }
    }
  }

  async checkHealth(): Promise<{
    status: 'ok' | 'degraded';
    checks: {
      db: { ok: boolean; latencyMs?: number };
      redis?: { ok: boolean; latencyMs?: number; enabled: boolean };
    };
    timestamp: string;
  }> {
    const checks: any = {
      db: await this.checkDatabase(),
    };

    // Vérifier Redis seulement si la queue est activée
    if (this.queueService.isEnabled() && this.redis) {
      checks.redis = await this.checkRedis();
    } else {
      checks.redis = {
        ok: false,
        enabled: false,
      };
    }

    // Déterminer le statut global
    const allChecksOk = checks.db.ok && (checks.redis?.ok !== false || !checks.redis?.enabled);
    const status = allChecksOk ? 'ok' : 'degraded';

    return {
      status,
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<{ ok: boolean; latencyMs?: number }> {
    try {
      const startTime = Date.now();
      // Utiliser une requête simple pour vérifier la connexion
      await this.prisma.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - startTime;

      return {
        ok: true,
        latencyMs,
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        ok: false,
      };
    }
  }

  private async checkRedis(): Promise<{ ok: boolean; latencyMs?: number; enabled: boolean }> {
    if (!this.redis) {
      return {
        ok: false,
        enabled: false,
      };
    }

    try {
      const startTime = Date.now();
      await this.redis.ping();
      const latencyMs = Date.now() - startTime;

      return {
        ok: true,
        latencyMs,
        enabled: true,
      };
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return {
        ok: false,
        enabled: true,
      };
    }
  }
}
