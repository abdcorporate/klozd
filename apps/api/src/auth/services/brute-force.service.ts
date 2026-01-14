import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BruteForceService {
  private MAX_FAILURES: number; // Lock after N failures (default: 5)
  private LOCK_DURATION_MS: number; // Lock duration in ms (default: 15 minutes)

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Allow config override
    this.MAX_FAILURES = this.configService.get<number>('BRUTE_FORCE_MAX_FAILURES') || 5;
    const lockDurationMinutes = this.configService.get<number>('BRUTE_FORCE_LOCK_DURATION_MINUTES') || 15;
    this.LOCK_DURATION_MS = lockDurationMinutes * 60 * 1000;
  }

  /**
   * Record a failed login attempt
   */
  async recordFailure(email: string, ip?: string): Promise<void> {
    const now = new Date();
    const lockedUntil = new Date(now.getTime() + this.LOCK_DURATION_MS);

    await this.prisma.authAttempt.upsert({
      where: {
        email_ip: {
          email,
          ip: ip || '',
        },
      },
      create: {
        email,
        ip: ip || null,
        failuresCount: 1,
        lockedUntil,
        lastAttemptAt: now,
      },
      update: {
        failuresCount: {
          increment: 1,
        },
        lastAttemptAt: now,
        lockedUntil: lockedUntil, // Reset lock duration on each failure
      },
    });
  }

  /**
   * Check if account is locked and throw if locked
   */
  async checkLocked(email: string, ip?: string): Promise<void> {
    const attempt = await this.prisma.authAttempt.findUnique({
      where: {
        email_ip: {
          email,
          ip: ip || '',
        },
      },
    });

    if (!attempt) {
      return; // No previous attempts
    }

    // Check if locked
    if (attempt.lockedUntil && attempt.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil(
        (attempt.lockedUntil.getTime() - new Date().getTime()) / 60000,
      );
      throw new UnauthorizedException(
        `Trop de tentatives de connexion échouées. Veuillez réessayer dans ${minutesRemaining} minute(s).`,
      );
    }

    // Check if should be locked based on failure count
    if (attempt.failuresCount >= this.MAX_FAILURES) {
      const lockedUntil = new Date(new Date().getTime() + this.LOCK_DURATION_MS);
      await this.prisma.authAttempt.update({
        where: {
          email_ip: {
            email,
            ip: ip || '',
          },
        },
        data: {
          lockedUntil,
        },
      });

      throw new UnauthorizedException(
        `Trop de tentatives de connexion échouées. Veuillez réessayer dans ${Math.ceil(this.LOCK_DURATION_MS / 60000)} minute(s).`,
      );
    }
  }

  /**
   * Reset failures on successful login
   */
  async resetFailures(email: string, ip?: string): Promise<void> {
    await this.prisma.authAttempt.deleteMany({
      where: {
        email,
        ip: ip || null,
      },
    });
  }

  /**
   * Clean up expired lock records (optional, can be called by cron)
   */
  async cleanupExpired(): Promise<number> {
    const result = await this.prisma.authAttempt.deleteMany({
      where: {
        lockedUntil: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }
}
