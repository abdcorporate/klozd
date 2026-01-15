import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Service Prisma avec isolation multi-tenant automatique
 * Garantit que tous les accès aux ressources multi-tenant sont filtrés par organizationId
 */
@Injectable()
export class TenantPrismaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Helper pour injecter organizationId dans un where clause
   */
  private injectOrgId<T extends { organizationId?: string }>(
    where: T,
    organizationId: string,
  ): T & { organizationId: string } {
    return {
      ...where,
      organizationId,
    };
  }

  // ============================================
  // LEAD
  // ============================================

  lead = {
    findUnique: async (args: { where: { id: string }; include?: any }, organizationId: string) => {
      // findUnique ne peut pas filtrer par organizationId, utiliser findFirst
      const lead = await this.prisma.lead.findFirst({
        ...args,
        where: {
          id: args.where.id,
          organizationId,
        },
      });
      if (!lead) {
        throw new NotFoundException('Lead non trouvé');
      }
      return lead;
    },

    findFirst: async (args: { where: any; include?: any }, organizationId: string) => {
      return this.prisma.lead.findFirst({
        ...args,
        where: this.injectOrgId(args.where, organizationId),
      });
    },

    findMany: async (args: { where?: any; include?: any; take?: number; skip?: number; orderBy?: any }, organizationId: string) => {
      return this.prisma.lead.findMany({
        ...args,
        where: args.where
          ? this.injectOrgId(args.where, organizationId)
          : { organizationId },
      });
    },

    update: async (args: { where: { id: string }; data: any; include?: any }, organizationId: string) => {
      // Vérifier que le lead existe et appartient à l'organisation
      const existing = await this.lead.findUnique({ where: { id: args.where.id } }, organizationId);
      return this.prisma.lead.update({
        ...args,
        where: { id: existing.id },
      });
    },

    delete: async (args: { where: { id: string } }, organizationId: string) => {
      // Vérifier que le lead existe et appartient à l'organisation
      await this.lead.findUnique({ where: { id: args.where.id } }, organizationId);
      return this.prisma.lead.delete({
        ...args,
        where: { id: args.where.id },
      });
    },

    count: async (args: { where?: any }, organizationId: string) => {
      return this.prisma.lead.count({
        ...args,
        where: args.where
          ? this.injectOrgId(args.where, organizationId)
          : { organizationId },
      });
    },
  };

  // ============================================
  // FORM
  // ============================================

  form = {
    findUnique: async (args: { where: { id: string } | { slug: string }; include?: any }, organizationId: string) => {
      const form = await this.prisma.form.findUnique({
        ...args,
      });
      if (!form) {
        throw new NotFoundException('Formulaire non trouvé');
      }
      if (form.organizationId !== organizationId) {
        throw new ForbiddenException('Vous n\'avez pas accès à ce formulaire');
      }
      return form;
    },

    findFirst: async (args: { where: any; include?: any }, organizationId: string) => {
      return this.prisma.form.findFirst({
        ...args,
        where: this.injectOrgId(args.where, organizationId),
      });
    },

    findMany: async (args: { where?: any; include?: any; take?: number; skip?: number; orderBy?: any }, organizationId: string) => {
      return this.prisma.form.findMany({
        ...args,
        where: args.where
          ? this.injectOrgId(args.where, organizationId)
          : { organizationId },
      });
    },

    update: async (args: { where: { id: string }; data: any; include?: any }, organizationId: string) => {
      // Vérifier que le form existe et appartient à l'organisation
      await this.form.findUnique({ where: { id: args.where.id } }, organizationId);
      return this.prisma.form.update({
        ...args,
        where: { id: args.where.id },
      });
    },

    delete: async (args: { where: { id: string } }, organizationId: string) => {
      // Vérifier que le form existe et appartient à l'organisation
      await this.form.findUnique({ where: { id: args.where.id } }, organizationId);
      return this.prisma.form.delete({
        ...args,
        where: { id: args.where.id },
      });
    },

    count: async (args: { where?: any }, organizationId: string) => {
      return this.prisma.form.count({
        ...args,
        where: args.where
          ? this.injectOrgId(args.where, organizationId)
          : { organizationId },
      });
    },
  };

  // ============================================
  // APPOINTMENT
  // ============================================

  appointment = {
    findUnique: async (args: { where: { id: string }; include?: any }, organizationId: string) => {
      const appointment = await this.prisma.appointment.findFirst({
        ...args,
        where: {
          id: args.where.id,
          lead: {
            organizationId,
          },
        },
      });
      if (!appointment) {
        throw new NotFoundException('Rendez-vous non trouvé');
      }
      return appointment;
    },

    findFirst: async (args: { where: any; include?: any }, organizationId: string) => {
      // Pour appointment, on doit filtrer via lead.organizationId
      const whereWithOrg = {
        ...args.where,
        lead: {
          organizationId,
          ...(args.where.lead || {}),
        },
      };
      return this.prisma.appointment.findFirst({
        ...args,
        where: whereWithOrg,
      });
    },

    findMany: async (args: { where?: any; include?: any; take?: number; skip?: number; orderBy?: any }, organizationId: string) => {
      const whereWithOrg = args.where
        ? {
            ...args.where,
            lead: {
              organizationId,
              ...(args.where.lead || {}),
            },
          }
        : {
            lead: {
              organizationId,
            },
          };
      return this.prisma.appointment.findMany({
        ...args,
        where: whereWithOrg,
      });
    },

    update: async (args: { where: { id: string }; data: any; include?: any }, organizationId: string) => {
      // Vérifier que l'appointment existe et appartient à l'organisation
      await this.appointment.findUnique({ where: { id: args.where.id } }, organizationId);
      return this.prisma.appointment.update({
        ...args,
        where: { id: args.where.id },
      });
    },

    delete: async (args: { where: { id: string } }, organizationId: string) => {
      // Vérifier que l'appointment existe et appartient à l'organisation
      await this.appointment.findUnique({ where: { id: args.where.id } }, organizationId);
      return this.prisma.appointment.delete({
        ...args,
        where: { id: args.where.id },
      });
    },

    count: async (args: { where?: any }, organizationId: string) => {
      const whereWithOrg = args.where
        ? {
            ...args.where,
            lead: {
              organizationId,
              ...(args.where.lead || {}),
            },
          }
        : {
            lead: {
              organizationId,
            },
          };
      return this.prisma.appointment.count({
        ...args,
        where: whereWithOrg,
      });
    },
  };

  // ============================================
  // DEAL
  // ============================================

  deal = {
    findUnique: async (args: { where: { id: string }; include?: any }, organizationId: string) => {
      const deal = await this.prisma.deal.findUnique({
        ...args,
      });
      if (!deal) {
        throw new NotFoundException('Deal non trouvé');
      }
      if (deal.organizationId !== organizationId) {
        throw new ForbiddenException('Vous n\'avez pas accès à ce deal');
      }
      return deal;
    },

    findFirst: async (args: { where: any; include?: any }, organizationId: string) => {
      return this.prisma.deal.findFirst({
        ...args,
        where: this.injectOrgId(args.where, organizationId),
      });
    },

    findMany: async (args: { where?: any; include?: any; take?: number; skip?: number; orderBy?: any }, organizationId: string) => {
      return this.prisma.deal.findMany({
        ...args,
        where: args.where
          ? this.injectOrgId(args.where, organizationId)
          : { organizationId },
      });
    },

    update: async (args: { where: { id: string }; data: any; include?: any }, organizationId: string) => {
      // Vérifier que le deal existe et appartient à l'organisation
      await this.deal.findUnique({ where: { id: args.where.id } }, organizationId);
      return this.prisma.deal.update({
        ...args,
        where: { id: args.where.id },
      });
    },

    delete: async (args: { where: { id: string } }, organizationId: string) => {
      // Vérifier que le deal existe et appartient à l'organisation
      await this.deal.findUnique({ where: { id: args.where.id } }, organizationId);
      return this.prisma.deal.delete({
        ...args,
        where: { id: args.where.id },
      });
    },

    aggregate: async (args: { where?: any; _count?: any; _sum?: any; _avg?: any; _min?: any; _max?: any }, organizationId: string) => {
      return this.prisma.deal.aggregate({
        ...args,
        where: args.where
          ? this.injectOrgId(args.where, organizationId)
          : { organizationId },
      });
    },
  };

  // ============================================
  // SITE
  // ============================================

  site = {
    findUnique: async (args: { where: { id: string } | { slug: string }; include?: any }, organizationId: string) => {
      const site = await this.prisma.site.findUnique({
        ...args,
      });
      if (!site) {
        throw new NotFoundException('Site non trouvé');
      }
      if (site.organizationId !== organizationId) {
        throw new ForbiddenException('Vous n\'avez pas accès à ce site');
      }
      return site;
    },

    findFirst: async (args: { where: any; include?: any }, organizationId: string) => {
      return this.prisma.site.findFirst({
        ...args,
        where: this.injectOrgId(args.where, organizationId),
      });
    },

    findMany: async (args: { where?: any; include?: any; take?: number; skip?: number; orderBy?: any }, organizationId: string) => {
      return this.prisma.site.findMany({
        ...args,
        where: args.where
          ? this.injectOrgId(args.where, organizationId)
          : { organizationId },
      });
    },

    update: async (args: { where: { id: string }; data: any; include?: any }, organizationId: string) => {
      // Vérifier que le site existe et appartient à l'organisation
      await this.site.findUnique({ where: { id: args.where.id } }, organizationId);
      return this.prisma.site.update({
        ...args,
        where: { id: args.where.id },
      });
    },

    delete: async (args: { where: { id: string } }, organizationId: string) => {
      // Vérifier que le site existe et appartient à l'organisation
      await this.site.findUnique({ where: { id: args.where.id } }, organizationId);
      return this.prisma.site.delete({
        ...args,
        where: { id: args.where.id },
      });
    },
  };

  // ============================================
  // NOTIFICATION
  // ============================================

  notification = {
    findUnique: async (args: { where: { id: string }; include?: any }, organizationId: string, userId: string) => {
      // Les notifications sont liées à un user, qui appartient à une organization
      const notification = await this.prisma.notification.findUnique({
        ...args,
        include: {
          ...args.include,
          user: true,
        },
      });
      if (!notification) {
        throw new NotFoundException('Notification non trouvée');
      }
      const notificationWithUser = notification as typeof notification & { user: { organizationId: string } | null };
      if (!notificationWithUser.user || notificationWithUser.user.organizationId !== organizationId) {
        throw new ForbiddenException('Vous n\'avez pas accès à cette notification');
      }
      return notification;
    },

    findMany: async (args: { where?: any; include?: any; take?: number; skip?: number; orderBy?: any }, organizationId: string, userId: string) => {
      // Filtrer par userId (qui appartient à organizationId)
      return this.prisma.notification.findMany({
        ...args,
        where: {
          ...args.where,
          userId,
        },
      });
    },

    update: async (args: { where: { id: string }; data: any }, organizationId: string, userId: string) => {
      // Vérifier que la notification existe et appartient à l'utilisateur
      await this.notification.findUnique({ where: { id: args.where.id } }, organizationId, userId);
      return this.prisma.notification.update({
        ...args,
        where: { id: args.where.id },
      });
    },

    updateMany: async (args: { where?: any; data: any }, organizationId: string, userId: string) => {
      return this.prisma.notification.updateMany({
        ...args,
        where: {
          ...args.where,
          userId,
        },
      });
    },
  };

  // ============================================
  // FORM_SUBMISSION, FORM_ABANDON, FORM_FIELD, FORM_VERSION
  // Ces modèles sont liés à Form, donc on filtre via form.organizationId
  // ============================================

  formSubmission = {
    findMany: async (args: { where?: any; include?: any; take?: number; skip?: number; orderBy?: any }, organizationId: string) => {
      const whereWithOrg = args.where
        ? {
            ...args.where,
            form: {
              organizationId,
              ...(args.where.form || {}),
            },
          }
        : {
            form: {
              organizationId,
            },
          };
      return this.prisma.formSubmission.findMany({
        ...args,
        where: whereWithOrg,
      });
    },
  };

  formAbandon = {
    findUnique: async (args: { where: { id: string }; include?: any }, organizationId: string) => {
      const abandon = await this.prisma.formAbandon.findFirst({
        ...args,
        where: {
          id: args.where.id,
          form: {
            organizationId,
          },
        },
      });
      if (!abandon) {
        throw new NotFoundException('Abandon non trouvé');
      }
      return abandon;
    },

    findFirst: async (args: { where: any; include?: any }, organizationId: string) => {
      const whereWithOrg = {
        ...args.where,
        form: {
          organizationId,
          ...(args.where.form || {}),
        },
      };
      return this.prisma.formAbandon.findFirst({
        ...args,
        where: whereWithOrg,
      });
    },

    findMany: async (args: { where?: any; include?: any; take?: number; skip?: number; orderBy?: any }, organizationId: string) => {
      const whereWithOrg = args.where
        ? {
            ...args.where,
            form: {
              organizationId,
              ...(args.where.form || {}),
            },
          }
        : {
            form: {
              organizationId,
            },
          };
      return this.prisma.formAbandon.findMany({
        ...args,
        where: whereWithOrg,
      });
    },

    update: async (args: { where: { id: string }; data: any }, organizationId: string) => {
      await this.formAbandon.findUnique({ where: { id: args.where.id } }, organizationId);
      return this.prisma.formAbandon.update({
        ...args,
        where: { id: args.where.id },
      });
    },
  };

  formField = {
    findMany: async (args: { where?: any; include?: any; take?: number; skip?: number; orderBy?: any }, organizationId: string) => {
      const whereWithOrg = args.where
        ? {
            ...args.where,
            form: {
              organizationId,
              ...(args.where.form || {}),
            },
          }
        : {
            form: {
              organizationId,
            },
          };
      return this.prisma.formField.findMany({
        ...args,
        where: whereWithOrg,
      });
    },
  };

  // ============================================
  // CALENDAR_CONFIG, ORGANIZATION_SETTINGS, INVITATION
  // Ces modèles ont organizationId directement
  // ============================================

  calendarConfig = {
    findUnique: async (args: { where: { organizationId: string } }, organizationId: string) => {
      if (args.where.organizationId !== organizationId) {
        throw new ForbiddenException('Vous n\'avez pas accès à cette configuration');
      }
      return this.prisma.calendarConfig.findUnique({
        ...args,
      });
    },
  };

  organizationSettings = {
    findUnique: async (args: { where: { organizationId: string } }, organizationId: string) => {
      if (args.where.organizationId !== organizationId) {
        throw new ForbiddenException('Vous n\'avez pas accès à ces paramètres');
      }
      return this.prisma.organizationSettings.findUnique({
        ...args,
      });
    },
  };

  invitation = {
    findUnique: async (args: { where: { id: string } | { token: string }; include?: any }, organizationId: string) => {
      const invitation = await this.prisma.invitation.findUnique({
        ...args,
      });
      if (!invitation) {
        throw new NotFoundException('Invitation non trouvée');
      }
      if (invitation.organizationId !== organizationId) {
        throw new ForbiddenException('Vous n\'avez pas accès à cette invitation');
      }
      return invitation;
    },

    findFirst: async (args: { where: any; include?: any }, organizationId: string) => {
      return this.prisma.invitation.findFirst({
        ...args,
        where: this.injectOrgId(args.where, organizationId),
      });
    },

    findMany: async (args: { where?: any; include?: any; take?: number; skip?: number; orderBy?: any }, organizationId: string) => {
      return this.prisma.invitation.findMany({
        ...args,
        where: args.where
          ? this.injectOrgId(args.where, organizationId)
          : { organizationId },
      });
    },

    update: async (args: { where: { id: string } | { token: string }; data: any }, organizationId: string) => {
      const existing = await this.invitation.findUnique({ where: args.where }, organizationId);
      if (!existing) {
        throw new NotFoundException('Invitation non trouvée');
      }
      // Utiliser le where original mais avec vérification d'organizationId
      const whereClause = 'id' in args.where 
        ? { id: args.where.id }
        : { token: args.where.token };
      return this.prisma.invitation.update({
        ...args,
        where: whereClause,
      });
    },
  };

  // ============================================
  // CALL
  // ============================================

  call = {
    findFirst: async (args: { where: any; include?: any }, organizationId: string) => {
      return this.prisma.call.findFirst({
        ...args,
        where: this.injectOrgId(args.where, organizationId),
      });
    },

    findMany: async (args: { where?: any; include?: any; take?: number; skip?: number; orderBy?: any }, organizationId: string) => {
      return this.prisma.call.findMany({
        ...args,
        where: args.where
          ? this.injectOrgId(args.where, organizationId)
          : { organizationId },
      });
    },

    update: async (args: { where: { id: string }; data: any }, organizationId: string) => {
      const call = await this.prisma.call.findFirst({
        where: {
          id: args.where.id,
          organizationId,
        },
      });
      if (!call) {
        throw new NotFoundException('Appel non trouvé');
      }
      return this.prisma.call.update({
        ...args,
        where: { id: args.where.id },
      });
    },
  };

  // ============================================
  // Accès direct à Prisma pour les opérations non multi-tenant
  // ============================================

  get raw() {
    return this.prisma;
  }

  // Pour les transactions
  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }
}
