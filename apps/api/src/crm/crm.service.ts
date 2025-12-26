import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto, UpdateDealDto } from './dto/crm.dto';

@Injectable()
export class CrmService {
  constructor(
    private prisma: PrismaService,
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
    filters?: any,
    page: number = 1,
    limit: number = 20,
  ) {
    // Construire les filtres selon le rôle
    let where: any = {
      organizationId,
      ...filters,
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

    // Pagination
    const skip = (page - 1) * limit;
    const [dealsData, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        skip,
        take: limit,
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.deal.count({ where }),
    ]);

    // Masquer les montants pour Manager
    const data = userRole === 'MANAGER'
      ? dealsData.map((deal) => {
          const { value, ...dealWithoutValue } = deal;
          return dealWithoutValue;
        })
      : dealsData;

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
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
    const oldDeal = await this.prisma.deal.findUnique({ where: { id } });
    const deal = await this.prisma.deal.update({
      where: { id },
      data: updateDealDto,
      include: {
        lead: true,
        createdBy: true,
      },
    });


    return deal;
  }
}

