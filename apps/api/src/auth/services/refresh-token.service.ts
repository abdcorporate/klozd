import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes, createHash } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);
  private readonly REFRESH_TOKEN_EXPIRES_DAYS = parseInt(
    process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7',
    10,
  );

  constructor(private prisma: PrismaService) {}

  /**
   * Génère un refresh token aléatoire
   */
  generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  /**
   * Hash le refresh token (bcrypt pour sécurité maximale)
   */
  async hashRefreshToken(token: string): Promise<string> {
    // Utiliser bcrypt avec salt rounds 10
    return bcrypt.hash(token, 10);
  }

  /**
   * Vérifie si un refresh token correspond au hash stocké
   */
  async verifyRefreshToken(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
  }

  /**
   * Crée un refresh token en DB
   */
  async createRefreshToken(
    userId: string,
    token: string,
    userAgent?: string,
    ip?: string,
  ): Promise<{ id: string; expiresAt: Date }> {
    const tokenHash = await this.hashRefreshToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRES_DAYS);

    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        userAgent: userAgent || null,
        ip: ip || null,
      },
    });

    return {
      id: refreshToken.id,
      expiresAt: refreshToken.expiresAt,
    };
  }

  /**
   * Trouve un refresh token valide par hash
   */
  async findValidRefreshToken(userId: string, token: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
    revokedAt: Date | null;
  } | null> {
    // Récupérer tous les refresh tokens actifs pour cet utilisateur
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // Vérifier chaque token (bcrypt est lent, donc on ne peut pas utiliser findFirst avec where)
    for (const dbToken of tokens) {
      const isValid = await this.verifyRefreshToken(token, dbToken.tokenHash);
      if (isValid) {
        return {
          id: dbToken.id,
          userId: dbToken.userId,
          expiresAt: dbToken.expiresAt,
          revokedAt: dbToken.revokedAt,
        };
      }
    }

    return null;
  }

  /**
   * Révoque un refresh token (logout ou rotation)
   */
  async revokeRefreshToken(tokenId: string, replacedById?: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: {
        revokedAt: new Date(),
        replacedById: replacedById || null,
      },
    });
  }

  /**
   * Révoque tous les refresh tokens d'un utilisateur (logout global)
   */
  async revokeAllUserTokens(userId: string): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Nettoie les refresh tokens expirés
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  /**
   * Rotation du refresh token : invalide l'ancien et crée un nouveau
   */
  async rotateRefreshToken(
    oldTokenId: string,
    userId: string,
    userAgent?: string,
    ip?: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    // Générer nouveau token
    const newToken = this.generateRefreshToken();
    const newTokenRecord = await this.createRefreshToken(userId, newToken, userAgent, ip);

    // Révoquer l'ancien token en le liant au nouveau
    await this.revokeRefreshToken(oldTokenId, newTokenRecord.id);

    return {
      token: newToken,
      expiresAt: newTokenRecord.expiresAt,
    };
  }
}
