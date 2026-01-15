import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { CreateDealDto, UpdateDealDto } from './dto/crm.dto';
import {
  PaginationQueryDto,
  buildOrderBy,
  buildCursorWhere,
  extractCursor,
  PaginatedResponse,
} from '../common/pagination';

@Injectable()
export class CrmService {
  constructor(
    private prisma: PrismaService,
    private tenantPrisma: TenantPrismaService,
  ) {}

  async createDeal(organizationId: string, userId: string, createDealDto: CreateDealDto) {
    const deal = await this.prisma.deal.create({
      data: {
        ...createDealDto,
        organizationId,
        createdById: userId,
      },
      include: {
        lead: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });


    return deal;
  }

  async findAllDeals(
    organizationId: string,
    userId: string,
    userRole: string,
    pagination: PaginationQueryDto,
    filters?: any,
  ): Promise<PaginatedResponse<any>> {
    const {
      limit = 25,
      cursor,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      q,
    } = pagination;

    // Construire les filtres selon le rôle
    let where: any = {
      organizationId,
      ...filters,
    };

    // Recherche textuelle (q)
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { lead: { email: { contains: q, mode: 'insensitive' } } },
        { lead: { firstName: { contains: q, mode: 'insensitive' } } },
        { lead: { lastName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // ADMIN : Tous les deals (pas de filtre supplémentaire)
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      // Pas de filtre supplémentaire
    }
    // Manager : Deals des leads assignés aux closers/setters de son organisation
    else if (userRole === 'MANAGER') {
      // Récupérer tous les closers et setters de l'organisation
      const closersAndSetters = await this.prisma.user.findMany({
        where: {
          organizationId,
          role: {
            in: ['CLOSER', 'SETTER'],
          },
        },
        select: {
          id: true,
        },
      });

      const userIds = closersAndSetters.map((u) => u.id);

      // Filtrer les deals : ceux dont le lead est assigné à un closer/setter de l'organisation
      const roleFilter = {
        lead: {
          OR: [
            { assignedCloserId: { in: userIds } },
            { assignedSetterId: { in: userIds } },
          ],
        },
      };

      // Combiner avec le filtre de recherche si présent
      if (where.OR) {
        where = {
          AND: [
            { OR: where.OR },
            roleFilter,
          ],
        };
      } else {
        where = { ...where, ...roleFilter };
      }
    }
    // Closer : Deals des leads qui lui sont assignés
    else if (userRole === 'CLOSER') {
      where.lead = {
        assignedCloserId: userId,
      };
    }
    // Setter : Deals des leads qu'il a qualifiés
    else if (userRole === 'SETTER') {
      where.lead = {
        assignedSetterId: userId,
      };
    }
    // Autres rôles : Pas d'accès
    else {
      where.id = 'none'; // Aucun résultat
    }

    // Cursor pagination
    const cursorWhere = buildCursorWhere(cursor, sortBy, sortOrder);
    if (cursorWhere) {
      where = {
        AND: [
          where,
          cursorWhere,
        ],
      };
    }

    // Ordering
    const orderBy = buildOrderBy(sortBy, sortOrder, { createdAt: 'desc', id: 'desc' });

    // Fetch one extra item to determine if there's a next page
    const take = limit + 1;
    const dealsData = await this.prisma.deal.findMany({
      where,
      take,
      include: {
        lead: {
          include: {
            assignedCloser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            assignedSetter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy,
    });

    // Masquer les montants pour Manager
    const allData = userRole === 'MANAGER'
      ? dealsData.map((deal) => {
          const { value, ...dealWithoutValue } = deal;
          return dealWithoutValue;
        })
      : dealsData;

    // Check if there's a next page
    const hasNextPage = allData.length > limit;
    const items = hasNextPage ? allData.slice(0, limit) : allData;

    // Extract cursor from last item
    const nextCursor = items.length > 0
      ? extractCursor(items[items.length - 1], sortBy)
      : null;

    return new PaginatedResponse(items, limit, nextCursor);
  }

  async getPipeline(organizationId: string, userId: string, userRole: string) {
    // Construire les filtres selon le rôle
    let where: any = {
      organizationId,
      status: 'ACTIVE',
    };

    // ADMIN : Tous les deals (pas de filtre supplémentaire)
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      // Pas de filtre supplémentaire
    }
    // Manager : Deals des leads assignés aux closers/setters de son organisation
    else if (userRole === 'MANAGER') {
      // Récupérer tous les closers et setters de l'organisation
      const closersAndSetters = await this.prisma.user.findMany({
        where: {
          organizationId,
          role: {
            in: ['CLOSER', 'SETTER'],
          },
        },
        select: {
          id: true,
        },
      });

      const userIds = closersAndSetters.map((u) => u.id);

      // Filtrer les deals : ceux dont le lead est assigné à un closer/setter de l'organisation
      where.lead = {
        OR: [
          { assignedCloserId: { in: userIds } },
          { assignedSetterId: { in: userIds } },
        ],
      };
    }
    // Closer : Deals des leads qui lui sont assignés
    else if (userRole === 'CLOSER') {
      where.lead = {
        assignedCloserId: userId,
      };
    }
    // Setter : Deals des leads qu'il a qualifiés
    else if (userRole === 'SETTER') {
      where.lead = {
        assignedSetterId: userId,
      };
    }
    // Autres rôles : Pas d'accès
    else {
      where.id = 'none'; // Aucun résultat
    }

    const deals = await this.prisma.deal.findMany({
      where,
      include: {
        lead: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Masquer les montants pour Manager
    const dealsToReturn = userRole === 'MANAGER'
      ? deals.map((deal) => {
          const { value, ...dealWithoutValue } = deal;
          return dealWithoutValue;
        })
      : deals;

    // Grouper par stage
    const pipeline: Record<string, typeof dealsToReturn> = {
      QUALIFIED: [],
      APPOINTMENT_SCHEDULED: [],
      PROPOSAL_SENT: [],
      NEGOTIATION: [],
      WON: [],
      LOST: [],
    };

    dealsToReturn.forEach((deal) => {
      const stage = deal.stage as keyof typeof pipeline;
      if (pipeline[stage]) {
        pipeline[stage].push(deal);
      }
    });

    return pipeline;
  }

  async updateDeal(id: string, organizationId: string, updateDealDto: UpdateDealDto) {
    // Utiliser TenantPrismaService pour garantir l'isolation multi-tenant
    const deal = await this.tenantPrisma.deal.update(
      {
        where: { id },
        data: updateDealDto,
        include: {
          lead: true,
          createdBy: true,
        },
      },
      organizationId,
    );

    return deal;
  }
}

