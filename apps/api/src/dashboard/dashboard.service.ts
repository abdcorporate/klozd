import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getCeoDashboard(organizationId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Statistiques générales
    const totalLeads = await this.prisma.lead.count({
      where: { organizationId },
    });

    const qualifiedLeads = await this.prisma.lead.count({
      where: {
        organizationId,
        status: 'QUALIFIED',
      },
    });

    const appointments = await this.prisma.appointment.count({
      where: {
        lead: {
          organizationId,
        },
        scheduledAt: { gte: startOfMonth },
      },
    });

    const completedAppointments = await this.prisma.appointment.count({
      where: {
        lead: {
          organizationId,
        },
        status: 'COMPLETED',
        scheduledAt: { gte: startOfMonth },
      },
    });

    const noShows = await this.prisma.appointment.count({
      where: {
        lead: {
          organizationId,
        },
        status: 'NO_SHOW',
        scheduledAt: { gte: startOfMonth },
      },
    });

    // Pipeline value
    const pipelineDeals = await this.prisma.deal.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
    });

    const pipelineValue = pipelineDeals.reduce((sum, deal) => sum + deal.value, 0);

    // Deals gagnés ce mois
    const wonDeals = await this.prisma.deal.findMany({
      where: {
        organizationId,
        status: 'WON',
        closedAt: { gte: startOfMonth },
      },
    });

    const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);

    // Performance par closer
    const closers = await this.prisma.user.findMany({
      where: {
        organizationId,
        role: 'CLOSER',
        status: 'ACTIVE',
      },
      include: {
        assignedAppointments: {
          where: {
            scheduledAt: { gte: startOfMonth },
            status: 'COMPLETED',
          },
        },
        createdDeals: {
          where: {
            status: 'WON',
            closedAt: { gte: startOfMonth },
          },
        },
      },
    });

    const closerPerformance = closers.map((closer) => {
      const totalCalls = closer.assignedAppointments.length;
      const wonDeals = closer.createdDeals.length;
      const closingRate = totalCalls > 0 ? (wonDeals / totalCalls) * 100 : 0;
      const revenue = closer.createdDeals.reduce((sum, deal) => sum + deal.value, 0);

      return {
        id: closer.id,
        name: `${closer.firstName} ${closer.lastName}`,
        totalCalls,
        wonDeals,
        closingRate: Math.round(closingRate),
        revenue,
      };
    });

    // Prochains appels aujourd'hui
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        lead: {
          organizationId,
        },
        scheduledAt: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
      include: {
        lead: {
          include: {
            aiPrediction: true,
          },
        },
        assignedCloser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    // Calculs de taux
    const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
    const appointmentRate = qualifiedLeads > 0 ? (appointments / qualifiedLeads) * 100 : 0;
    const showRate = appointments > 0 ? ((completedAppointments / appointments) * 100) : 0;
    const noShowRate = appointments > 0 ? ((noShows / appointments) * 100) : 0;
    const closingRate = completedAppointments > 0
      ? (wonDeals.length / completedAppointments) * 100
      : 0;

    return {
      overview: {
        totalLeads,
        qualifiedLeads,
        appointments,
        completedAppointments,
        wonDeals: wonDeals.length,
        pipelineValue,
        wonValue,
      },
      conversions: {
        qualificationRate: Math.round(qualificationRate),
        appointmentRate: Math.round(appointmentRate),
        showRate: Math.round(showRate),
        noShowRate: Math.round(noShowRate),
        closingRate: Math.round(closingRate),
      },
      closerPerformance,
      upcomingAppointments: upcomingAppointments.map((apt) => ({
        id: apt.id,
        scheduledAt: apt.scheduledAt,
        lead: {
          id: apt.lead.id,
          firstName: apt.lead.firstName,
          lastName: apt.lead.lastName,
          email: apt.lead.email,
        },
        closer: apt.assignedCloser,
        closingProbability: apt.lead.aiPrediction?.closingProbability || apt.lead.closingProbability || 0,
      })),
    };
  }

  /**
   * Récupère les données de tendances sur 30 jours pour le dashboard ADMIN
   */
  async getCeoTrends(organizationId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Générer les dates pour les 30 derniers jours
    const dates: Date[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }

    // Récupérer les leads par jour
    const leadsByDay = await Promise.all(
      dates.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const [total, qualified, appointments, revenue] = await Promise.all([
          this.prisma.lead.count({
            where: {
              organizationId,
              createdAt: {
                gte: date,
                lt: nextDay,
              },
            },
          }),
          this.prisma.lead.count({
            where: {
              organizationId,
              status: 'QUALIFIED',
              createdAt: {
                gte: date,
                lt: nextDay,
              },
            },
          }),
          this.prisma.appointment.count({
            where: {
              lead: {
                organizationId,
              },
              scheduledAt: {
                gte: date,
                lt: nextDay,
              },
            },
          }),
          this.prisma.deal
            .findMany({
              where: {
                organizationId,
                status: 'WON',
                closedAt: {
                  gte: date,
                  lt: nextDay,
                },
              },
            })
            .then((deals) => deals.reduce((sum, deal) => sum + (deal.value || 0), 0)),
        ]);

        return {
          date: date.toISOString().split('T')[0],
          leads: total,
          qualified,
          appointments,
          revenue,
        };
      }),
    );

    // Calculer les projections de revenus (moyenne des 7 derniers jours * 30)
    const last7DaysRevenue = leadsByDay
      .slice(-7)
      .reduce((sum, day) => sum + day.revenue, 0);
    const avgDailyRevenue = last7DaysRevenue / 7;
    const projectedMonthlyRevenue = avgDailyRevenue * 30;

    return {
      trends: leadsByDay,
      projections: {
        monthlyRevenue: projectedMonthlyRevenue,
        avgDailyRevenue,
      },
    };
  }

  /**
   * Récupère les données de performance des closers et setters pour le dashboard Manager
   */
  async getManagerClosersSettersPerformance(organizationId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Récupérer tous les closers et setters de l'organisation
    const closersAndSetters = await this.prisma.user.findMany({
      where: {
        organizationId,
        role: {
          in: ['CLOSER', 'SETTER'],
        },
        status: 'ACTIVE',
      },
      include: {
        assignedAppointments: {
          where: {
            scheduledAt: { gte: startOfMonth },
            status: 'COMPLETED',
          },
        },
        createdDeals: {
          where: {
            status: 'WON',
            closedAt: { gte: startOfMonth },
          },
        },
        assignedLeads: {
          where: {
            createdAt: { gte: startOfMonth },
          },
        },
      },
    });

    // Performance par utilisateur (sans revenue pour Manager)
    const performance = closersAndSetters.map((user) => {
      const totalCalls = user.assignedAppointments.length;
      const wonDeals = user.createdDeals.length;
      const closingRate = totalCalls > 0 ? (wonDeals / totalCalls) * 100 : 0;
      const totalLeads = user.assignedLeads.length;

      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        totalCalls,
        wonDeals,
        closingRate: Math.round(closingRate),
        // Pas de revenue pour Manager
        totalLeads,
      };
    });

    // Stats globales (sans revenue pour Manager)
    const totalCalls = performance.reduce((sum, p) => sum + p.totalCalls, 0);
    const totalWon = performance.reduce((sum, p) => sum + p.wonDeals, 0);
    const avgClosingRate = totalCalls > 0 ? (totalWon / totalCalls) * 100 : 0;

    return {
      performance,
      stats: {
        totalClosers: closersAndSetters.filter((u) => u.role === 'CLOSER').length,
        totalSetters: closersAndSetters.filter((u) => u.role === 'SETTER').length,
        totalCalls,
        totalWon,
        // Pas de totalRevenue pour Manager
        avgClosingRate: Math.round(avgClosingRate),
      },
    };
  }

  async getCloserDashboard(userId: string, organizationId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Appels aujourd'hui
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const todayAppointments = await this.prisma.appointment.findMany({
      where: {
        assignedCloserId: userId,
        scheduledAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        lead: {
          include: {
            aiPrediction: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    // Follow-ups à faire (remplacé par appointments à venir)
    const pendingActivities: any[] = [];

    // Stats du mois
    const monthlyAppointments = await this.prisma.appointment.count({
      where: {
        assignedCloserId: userId,
        scheduledAt: { gte: startOfMonth },
        status: 'COMPLETED',
      },
    });

    const monthlyWonDeals = await this.prisma.deal.count({
      where: {
        createdById: userId,
        status: 'WON',
        closedAt: { gte: startOfMonth },
      },
    });

    const monthlyRevenue = await this.prisma.deal.aggregate({
      where: {
        createdById: userId,
        status: 'WON',
        closedAt: { gte: startOfMonth },
      },
      _sum: {
        value: true,
      },
    });

    const monthlyClosingRate = monthlyAppointments > 0
      ? (monthlyWonDeals / monthlyAppointments) * 100
      : 0;

    // Classement équipe
    const allClosers = await this.prisma.user.findMany({
      where: {
        organizationId,
        role: 'CLOSER',
        status: 'ACTIVE',
      },
      include: {
        assignedAppointments: {
          where: {
            scheduledAt: { gte: startOfMonth },
            status: 'COMPLETED',
          },
        },
        createdDeals: {
          where: {
            status: 'WON',
            closedAt: { gte: startOfMonth },
          },
        },
      },
    });

    const leaderboard = allClosers
      .map((closer) => {
        const calls = closer.assignedAppointments.length;
        const won = closer.createdDeals.length;
        const rate = calls > 0 ? (won / calls) * 100 : 0;
        return {
          id: closer.id,
          name: `${closer.firstName} ${closer.lastName}`,
          closingRate: Math.round(rate),
        };
      })
      .sort((a, b) => b.closingRate - a.closingRate);

    return {
      todayAppointments: todayAppointments.map((apt) => ({
        id: apt.id,
        scheduledAt: apt.scheduledAt,
        lead: {
          id: apt.lead.id,
          firstName: apt.lead.firstName,
          lastName: apt.lead.lastName,
          email: apt.lead.email,
        },
        closingProbability: apt.lead.aiPrediction?.closingProbability || apt.lead.closingProbability || 0,
      })),
      pendingFollowUps: pendingActivities,
      monthlyStats: {
        appointments: monthlyAppointments,
        wonDeals: monthlyWonDeals,
        closingRate: Math.round(monthlyClosingRate),
        revenue: monthlyRevenue._sum.value || 0,
      },
      leaderboard,
    };
  }

  async getManagerDashboard(userId: string, organizationId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    console.log(`[DashboardService] getManagerDashboard - userId: ${userId}, organizationId: ${organizationId}`);

    // Statistiques générales (même structure que ADMIN mais sans les valeurs monétaires)
    const totalLeads = await this.prisma.lead.count({
      where: { organizationId },
    });
    
    console.log(`[DashboardService] totalLeads: ${totalLeads}`);

    const qualifiedLeads = await this.prisma.lead.count({
      where: {
        organizationId,
        status: 'QUALIFIED',
      },
    });

    const appointments = await this.prisma.appointment.count({
      where: {
        lead: {
          organizationId,
        },
        scheduledAt: { gte: startOfMonth },
      },
    });

    const completedAppointments = await this.prisma.appointment.count({
      where: {
        lead: {
          organizationId,
        },
        status: 'COMPLETED',
        scheduledAt: { gte: startOfMonth },
      },
    });

    const noShows = await this.prisma.appointment.count({
      where: {
        lead: {
          organizationId,
        },
        status: 'NO_SHOW',
        scheduledAt: { gte: startOfMonth },
      },
    });

    // Deals gagnés ce mois (sans valeur monétaire)
    const wonDeals = await this.prisma.deal.findMany({
      where: {
        organizationId,
        status: 'WON',
        closedAt: { gte: startOfMonth },
      },
    });

    // Performance par closer (sans revenue)
    const closers = await this.prisma.user.findMany({
      where: {
        organizationId,
        role: 'CLOSER',
        status: 'ACTIVE',
      },
      include: {
        assignedAppointments: {
          where: {
            scheduledAt: { gte: startOfMonth },
            status: 'COMPLETED',
          },
        },
        createdDeals: {
          where: {
            status: 'WON',
            closedAt: { gte: startOfMonth },
          },
        },
      },
    });

    const closerPerformance = closers.map((closer) => {
      const totalCalls = closer.assignedAppointments.length;
      const wonDeals = closer.createdDeals.length;
      const closingRate = totalCalls > 0 ? (wonDeals / totalCalls) * 100 : 0;

      return {
        id: closer.id,
        name: `${closer.firstName} ${closer.lastName}`,
        totalCalls,
        wonDeals,
        closingRate: Math.round(closingRate),
      };
    });

    // Prochains appels aujourd'hui
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        lead: {
          organizationId,
        },
        scheduledAt: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
      include: {
        lead: {
          include: {
            aiPrediction: true,
          },
        },
        assignedCloser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    // Calculs de taux
    const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
    const appointmentRate = qualifiedLeads > 0 ? (appointments / qualifiedLeads) * 100 : 0;
    const showRate = appointments > 0 ? ((completedAppointments / appointments) * 100) : 0;
    const noShowRate = appointments > 0 ? ((noShows / appointments) * 100) : 0;
    const closingRate = completedAppointments > 0
      ? (wonDeals.length / completedAppointments) * 100
      : 0;

    return {
      overview: {
        totalLeads,
        qualifiedLeads,
        appointments,
        completedAppointments,
        wonDeals: wonDeals.length,
        // Pas de pipelineValue ni wonValue pour Manager
      },
      conversions: {
        qualificationRate: Math.round(qualificationRate),
        appointmentRate: Math.round(appointmentRate),
        showRate: Math.round(showRate),
        noShowRate: Math.round(noShowRate),
        closingRate: Math.round(closingRate),
      },
      closerPerformance,
      upcomingAppointments: upcomingAppointments.map((apt) => ({
        id: apt.id,
        scheduledAt: apt.scheduledAt,
        lead: {
          id: apt.lead.id,
          firstName: apt.lead.firstName,
          lastName: apt.lead.lastName,
          email: apt.lead.email,
        },
        closer: apt.assignedCloser,
        closingProbability: apt.lead.aiPrediction?.closingProbability || apt.lead.closingProbability || 0,
      })),
    };
  }

  async getSetterDashboard(userId: string, organizationId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Leads à qualifier (assignés au setter ou non assignés)
    // Note: assignedSetterId sera disponible après migration complète
    const leadsToQualify = await this.prisma.lead.findMany({
      where: {
        organizationId,
        status: {
          in: ['NEW', 'QUALIFIED'],
        },
      } as any,
      include: {
        form: true,
        aiPrediction: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    // RDV à planifier (leads qualifiés sans RDV)
    // Note: Pour l'instant, on filtre par organizationId
    // TODO: Filtrer par assignedSetterId quand disponible
    const leadsToSchedule = await this.prisma.lead.findMany({
      where: {
        organizationId,
        status: 'QUALIFIED',
        appointments: {
          none: {
            status: {
              in: ['SCHEDULED', 'CONFIRMED'],
            },
          },
        },
      },
      include: {
        form: true,
        aiPrediction: true,
      },
      orderBy: {
        qualificationScore: 'desc',
      },
      take: 10,
    });

    // Stats de qualification du mois
    // Note: Pour l'instant, on compte tous les leads qualifiés
    // TODO: Filtrer par assignedSetterId quand disponible
    const qualifiedThisMonth = await this.prisma.lead.count({
      where: {
        organizationId,
        status: 'QUALIFIED',
        qualifiedAt: { gte: startOfMonth },
      },
    });

    const scheduledThisMonth = await this.prisma.appointment.count({
      where: {
        lead: {
          organizationId,
        },
        scheduledAt: { gte: startOfMonth },
      },
    });

    const qualificationRate =
      leadsToQualify.length > 0
        ? (qualifiedThisMonth / leadsToQualify.length) * 100
        : 0;

    return {
      leadsToQualify: leadsToQualify.map((lead) => ({
        id: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        qualificationScore: lead.qualificationScore,
        status: lead.status,
        createdAt: lead.createdAt,
        formName: lead.form?.name,
        closingProbability: lead.aiPrediction?.closingProbability || lead.closingProbability || 0,
      })),
      leadsToSchedule: leadsToSchedule.map((lead) => ({
        id: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        qualificationScore: lead.qualificationScore,
        budget: lead.budget,
        sector: lead.sector,
        closingProbability: lead.aiPrediction?.closingProbability || lead.closingProbability || 0,
      })),
      stats: {
        qualifiedThisMonth,
        scheduledThisMonth,
        qualificationRate: Math.round(qualificationRate),
      },
    };
  }

  async getAdminDashboard() {
    // Dashboard Super Admin - Vue globale sur toutes les organisations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Statistiques globales
    const totalOrganizations = await this.prisma.organization.count();
    const totalUsers = await this.prisma.user.count({
      where: { status: 'ACTIVE' },
    });
    const totalLeads = await this.prisma.lead.count();
    const totalDeals = await this.prisma.deal.count();
    const totalWonDeals = await this.prisma.deal.count({
      where: {
        status: 'WON',
        closedAt: { gte: startOfMonth },
      },
    });

    const totalRevenue = await this.prisma.deal.aggregate({
      where: {
        status: 'WON',
        closedAt: { gte: startOfMonth },
      },
      _sum: {
        value: true,
      },
    });

    // Organisations récentes
    const recentOrganizations = await this.prisma.organization.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            users: true,
            leads: true,
            deals: true,
          },
        },
        settings: {
          select: {
            subscriptionPlan: true,
            monthlyPrice: true,
          },
        },
      },
    });

    // Utilisateurs par rôle
    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      where: {
        status: 'ACTIVE',
      },
      _count: {
        role: true,
      },
    });

    // Organisations par plan
    const organizationsByPlan = await this.prisma.organizationSettings.groupBy({
      by: ['subscriptionPlan'],
      _count: {
        subscriptionPlan: true,
      },
    });

    // Top organisations par revenus
    const topOrganizations = await this.prisma.organization.findMany({
      include: {
        deals: {
          where: {
            status: 'WON',
            closedAt: { gte: startOfMonth },
          },
        },
        _count: {
          select: {
            users: true,
            leads: true,
          },
        },
      },
    });

    const organizationsWithRevenue = topOrganizations
      .map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        revenue: org.deals.reduce((sum, deal) => sum + deal.value, 0),
        userCount: org._count.users,
        leadCount: org._count.leads,
        dealCount: org.deals.length,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      overview: {
        totalOrganizations,
        totalUsers,
        totalLeads,
        totalDeals,
        totalWonDeals,
        totalRevenue: totalRevenue._sum.value || 0,
      },
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count.role,
      })),
      organizationsByPlan: organizationsByPlan.map((item) => ({
        plan: item.subscriptionPlan,
        count: item._count.subscriptionPlan,
      })),
      recentOrganizations: recentOrganizations.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        createdAt: org.createdAt,
        userCount: org._count.users,
        leadCount: org._count.leads,
        dealCount: org._count.deals,
        plan: org.settings?.subscriptionPlan || 'solo',
        monthlyPrice: org.settings?.monthlyPrice || 0,
      })),
      topOrganizations: organizationsWithRevenue,
    };
  }
}

