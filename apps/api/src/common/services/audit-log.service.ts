import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditLogChangeParams {
  actor: { id: string } | null; // Utilisateur qui effectue l'action (null si système)
  orgId: string; // Organization ID
  action: string; // Action (CREATE, UPDATE, DELETE, ASSIGN, QUALIFY, DISQUALIFY, PUBLISH, etc.)
  entityType: string; // Type d'entité (LEAD, FORM, APPOINTMENT, USER, SETTINGS, etc.)
  entityId: string; // ID de l'entité
  before?: any; // État avant (sera sérialisé en JSON)
  after?: any; // État après (sera sérialisé en JSON)
  reqMeta?: {
    ip?: string;
    userAgent?: string;
  };
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Enregistre un changement dans l'audit log
   */
  async logChange(params: AuditLogChangeParams): Promise<void> {
    try {
      const { actor, orgId, action, entityType, entityId, before, after, reqMeta } = params;

      // Sérialiser before/after en JSON (exclure les champs sensibles si nécessaire)
      const beforeJson = before ? JSON.stringify(this.sanitizeData(before)) : null;
      const afterJson = after ? JSON.stringify(this.sanitizeData(after)) : null;

      await this.prisma.auditLog.create({
        data: {
          organizationId: orgId,
          actorUserId: actor?.id || null,
          action,
          entityType,
          entityId,
          beforeJson,
          afterJson,
          ip: reqMeta?.ip || null,
          userAgent: reqMeta?.userAgent || null,
        },
      });
    } catch (error) {
      // Ne pas faire échouer l'opération principale si l'audit log échoue
      this.logger.error(`Erreur lors de l'enregistrement de l'audit log: ${error.message}`, error.stack);
    }
  }

  /**
   * Nettoie les données sensibles avant sérialisation
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };

    // Exclure les champs sensibles
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken'];
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        delete sanitized[field];
      }
    }

    return sanitized;
  }

  /**
   * Récupère les logs d'audit avec pagination
   */
  async getAuditLogs(
    organizationId: string,
    filters?: {
      entityType?: string;
      entityId?: string;
      action?: string;
      actorUserId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    pagination?: {
      limit?: number;
      cursor?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const limit = pagination?.limit || 25;
    const sortBy = pagination?.sortBy || 'createdAt';
    const sortOrder = pagination?.sortOrder || 'desc';

    let where: any = {
      organizationId,
    };

    if (filters?.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters?.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.actorUserId) {
      where.actorUserId = filters.actorUserId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    // Cursor pagination
    if (pagination?.cursor) {
      const cursorValue = JSON.parse(Buffer.from(pagination.cursor, 'base64').toString());
      where = {
        ...where,
        OR: [
          {
            [sortBy]: sortOrder === 'desc' ? { lt: cursorValue[sortBy] } : { gt: cursorValue[sortBy] },
          },
          {
            [sortBy]: cursorValue[sortBy],
            id: sortOrder === 'desc' ? { lt: cursorValue.id } : { gt: cursorValue.id },
          },
        ],
      };
    }

    const orderBy: any = {
      [sortBy]: sortOrder,
      id: sortOrder,
    };

    const data = await this.prisma.auditLog.findMany({
      where,
      take: limit + 1, // +1 pour déterminer s'il y a une page suivante
      orderBy,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const hasNextPage = data.length > limit;
    const items = hasNextPage ? data.slice(0, limit) : data;

    // Extraire le curseur du dernier élément
    const nextCursor = items.length > 0
      ? Buffer.from(
          JSON.stringify({
            [sortBy]: items[items.length - 1][sortBy],
            id: items[items.length - 1].id,
          }),
        ).toString('base64')
      : null;

    return {
      items,
      pageInfo: {
        hasNextPage,
        nextCursor,
      },
    };
  }
}
