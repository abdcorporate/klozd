import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ExportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Exporte les leads en CSV
   */
  async exportLeads(
    organizationId: string,
    userId: string,
    userRole: UserRole,
    filters?: any,
  ): Promise<string> {
    let where: any = { organizationId, ...filters };

    // Filtrage par rôle
    if (userRole === UserRole.CLOSER) {
      where.assignedCloserId = userId;
    } else if (userRole === UserRole.SETTER) {
      where.assignedSetterId = userId;
    } else if (userRole === UserRole.MANAGER) {
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
      where.OR = [
        { assignedCloserId: { in: userIds } },
        { assignedSetterId: { in: userIds } },
      ];
    }

    const leads = await this.prisma.lead.findMany({
      where,
      include: {
        assignedCloser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedSetter: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        form: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Générer CSV
    const headers = [
      'ID',
      'Prénom',
      'Nom',
      'Email',
      'Téléphone',
      'Statut',
      'Score',
      'Budget',
      'Secteur',
      'Source',
      'Closer',
      'Setter',
      'Formulaire',
      'Date création',
    ];

    const rows = leads.map((lead) => [
      lead.id,
      lead.firstName || '',
      lead.lastName || '',
      lead.email,
      lead.phone || '',
      lead.status,
      lead.qualificationScore?.toString() || '',
      lead.budget?.toString() || '',
      lead.sector || '',
      lead.source || '',
      lead.assignedCloser
        ? `${lead.assignedCloser.firstName} ${lead.assignedCloser.lastName}`
        : '',
      lead.assignedSetter
        ? `${lead.assignedSetter.firstName} ${lead.assignedSetter.lastName}`
        : '',
      lead.form?.name || '',
      lead.createdAt.toISOString(),
    ]);

    return this.generateCSV(headers, rows);
  }

  /**
   * Exporte les deals en CSV
   */
  async exportDeals(
    organizationId: string,
    userId: string,
    userRole: UserRole,
    filters?: any,
  ): Promise<string> {
    let where: any = { organizationId, ...filters };

    // Filtrage par rôle
    if (userRole === UserRole.CLOSER) {
      where.lead = { assignedCloserId: userId };
    } else if (userRole === UserRole.SETTER) {
      where.lead = { assignedSetterId: userId };
    } else if (userRole === UserRole.MANAGER) {
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
      where.lead = {
        OR: [
          { assignedCloserId: { in: userIds } },
          { assignedSetterId: { in: userIds } },
        ],
      };
    }

    const deals = await this.prisma.deal.findMany({
      where,
      include: {
        lead: {
          include: {
            assignedCloser: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'ID',
      'Titre',
      'Valeur',
      'Étape',
      'Statut',
      'Lead',
      'Email Lead',
      'Closer',
      'Créé par',
      'Date création',
      'Date fermeture',
    ];

    const rows = deals.map((deal) => [
      deal.id,
      deal.title,
      deal.value?.toString() || '0',
      deal.stage,
      deal.status,
      `${deal.lead.firstName || ''} ${deal.lead.lastName || ''}`.trim() || deal.lead.email,
      deal.lead.email,
      deal.lead.assignedCloser
        ? `${deal.lead.assignedCloser.firstName} ${deal.lead.assignedCloser.lastName}`
        : '',
      `${deal.createdBy.firstName} ${deal.createdBy.lastName}`,
      deal.createdAt.toISOString(),
      deal.closedAt?.toISOString() || '',
    ]);

    return this.generateCSV(headers, rows);
  }

  /**
   * Génère un CSV à partir de headers et rows
   */
  private generateCSV(headers: string[], rows: any[][]): string {
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ];

    return csvRows.join('\n');
  }
}



