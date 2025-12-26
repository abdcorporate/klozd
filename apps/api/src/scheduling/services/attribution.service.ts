import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Lead, User } from '@prisma/client';
import { CalendarConfigService } from '../../calendar-config/calendar-config.service';

@Injectable()
export class AttributionService {
  constructor(
    private prisma: PrismaService,
    private calendarConfigService: CalendarConfigService,
  ) {}

  /**
   * Attribue un lead qualifié au meilleur closer disponible
   * Utilise l'IA pour trouver le meilleur match
   */
  async assignLeadToCloser(
    organizationId: string,
    lead: Lead,
  ): Promise<User | null> {
    // Récupérer la configuration du calendrier pour obtenir les closers sélectionnés
    let allowedCloserIds: string[] = [];
    try {
      const calendarConfig = await this.calendarConfigService.findOne(organizationId);
      if (calendarConfig.assignedClosers && Array.isArray(calendarConfig.assignedClosers) && calendarConfig.assignedClosers.length > 0) {
        allowedCloserIds = calendarConfig.assignedClosers;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration du calendrier:', error);
      // Si erreur, continuer avec tous les closers (comportement par défaut)
    }

    // Construire la condition where pour filtrer les closers
    const whereClause: any = {
      organizationId,
      role: 'CLOSER',
      status: 'ACTIVE',
    };

    // Si des closers sont spécifiés dans la config, ne garder que ceux-là
    if (allowedCloserIds.length > 0) {
      whereClause.id = { in: allowedCloserIds };
    }

    // Récupérer les closeurs actifs de l'organisation (filtrés par la config si applicable)
    const closers = await this.prisma.user.findMany({
      where: whereClause,
      include: {
        closerSettings: true,
        _count: {
          select: {
            assignedLeads: {
              where: {
                status: {
                  in: ['QUALIFIED', 'APPOINTMENT_SCHEDULED'],
                },
              },
            },
            assignedAppointments: {
              where: {
                status: {
                  in: ['SCHEDULED', 'CONFIRMED'],
                },
                scheduledAt: {
                  gte: new Date(),
                },
              },
            },
          },
        },
      },
    });

    if (closers.length === 0) {
      return null;
    }

    // Si un seul closer, l'attribuer directement
    if (closers.length === 1) {
      return closers[0];
    }

    // Calculer un score pour chaque closer
    const closerScores = closers.map((closer) => {
      let score = 0;

      // 1. Match de secteur (si le closer a des secteurs préférés)
      if (lead.sector && closer.closerSettings?.preferredSectors) {
        const preferredSectors = closer.closerSettings.preferredSectors.map((s: string) =>
          s.toLowerCase(),
        );
        if (preferredSectors.includes(lead.sector.toLowerCase())) {
          score += 30; // Bonus important pour match de secteur
        }
      }

      // 2. Taux de closing du closer
      if (closer.closerSettings?.closingRate) {
        score += closer.closerSettings.closingRate * 0.3; // Jusqu'à 30 points
      }

      // 3. Charge de travail (moins de leads = meilleur score)
      const leadCount = closer._count.assignedLeads;
      const appointmentCount = closer._count.assignedAppointments;
      const totalLoad = leadCount + appointmentCount;
      score += Math.max(0, 20 - totalLoad * 2); // Jusqu'à 20 points

      // 4. Round robin simple (alternance)
      score += Math.random() * 5; // 0-5 points aléatoires pour varier

      return {
        closer,
        score,
      };
    });

    // Trier par score décroissant et retourner le meilleur
    closerScores.sort((a, b) => b.score - a.score);
    return closerScores[0].closer;
  }

  /**
   * Round robin simple : attribue en alternance
   */
  async roundRobinAssign(
    organizationId: string,
    lead: Lead,
  ): Promise<User | null> {
    // Récupérer la configuration du calendrier pour obtenir les closers sélectionnés
    let allowedCloserIds: string[] = [];
    try {
      const calendarConfig = await this.calendarConfigService.findOne(organizationId);
      if (calendarConfig.assignedClosers && Array.isArray(calendarConfig.assignedClosers) && calendarConfig.assignedClosers.length > 0) {
        allowedCloserIds = calendarConfig.assignedClosers;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration du calendrier:', error);
      // Si erreur, continuer avec tous les closers (comportement par défaut)
    }

    // Construire la condition where pour filtrer les closers
    const whereClause: any = {
      organizationId,
      role: 'CLOSER',
      status: 'ACTIVE',
    };

    // Si des closers sont spécifiés dans la config, ne garder que ceux-là
    if (allowedCloserIds.length > 0) {
      whereClause.id = { in: allowedCloserIds };
    }

    const closers = await this.prisma.user.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            assignedLeads: {
              where: {
                status: {
                  in: ['QUALIFIED', 'APPOINTMENT_SCHEDULED'],
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (closers.length === 0) {
      return null;
    }

    // Trouver le closer avec le moins de leads assignés
    const closerWithMinLeads = closers.reduce((min, closer) => {
      const minCount = min._count.assignedLeads;
      const closerCount = closer._count.assignedLeads;
      return closerCount < minCount ? closer : min;
    });

    return closerWithMinLeads;
  }
}

