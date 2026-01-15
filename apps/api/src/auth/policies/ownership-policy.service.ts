import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

export enum ResourceType {
  LEAD = 'LEAD',
  APPOINTMENT = 'APPOINTMENT',
  DEAL = 'DEAL',
}

@Injectable()
export class OwnershipPolicyService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Vérifie si l'ownership check est activé (feature flag)
   */
  private isOwnershipEnabled(): boolean {
    return this.configService.get<string>('ENABLE_OWNERSHIP_CHECK') === 'true';
  }

  /**
   * Vérifie si un utilisateur peut accéder à un lead
   */
  async canAccessLead(
    userId: string,
    userRole: string,
    organizationId: string,
    leadId: string,
  ): Promise<boolean> {
    // Si l'ownership check est désactivé, autoriser (comportement par défaut)
    if (!this.isOwnershipEnabled()) {
      return true;
    }

    // SUPER_ADMIN et ADMIN : accès full org
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      return true;
    }

    // MANAGER : accès full org
    if (userRole === 'MANAGER') {
      return true;
    }

    // Récupérer le lead
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        organizationId,
      },
      select: {
        id: true,
        assignedCloserId: true,
        assignedSetterId: true,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead non trouvé');
    }

    // CLOSER : lecture uniquement si assignedCloserId = user.id ou si non assigné
    if (userRole === 'CLOSER') {
      return lead.assignedCloserId === userId || !lead.assignedCloserId;
    }

    // SETTER : lecture si assignedSetterId = user.id ou si non assigné
    if (userRole === 'SETTER') {
      return lead.assignedSetterId === userId || !lead.assignedSetterId;
    }

    return false;
  }

  /**
   * Vérifie si un utilisateur peut accéder à un appointment
   */
  async canAccessAppointment(
    userId: string,
    userRole: string,
    organizationId: string,
    appointmentId: string,
  ): Promise<boolean> {
    // Si l'ownership check est désactivé, autoriser (comportement par défaut)
    if (!this.isOwnershipEnabled()) {
      return true;
    }

    // SUPER_ADMIN et ADMIN : accès full org
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      return true;
    }

    // MANAGER : accès full org
    if (userRole === 'MANAGER') {
      return true;
    }

    // Récupérer l'appointment
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        lead: {
          organizationId,
        },
      },
      select: {
        id: true,
        assignedCloserId: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Rendez-vous non trouvé');
    }

    // CLOSER : lecture uniquement si assignedCloserId = user.id
    if (userRole === 'CLOSER') {
      return appointment.assignedCloserId === userId;
    }

    // SETTER : pas d'accès direct aux appointments (ou lecture limitée si déjà prévu)
    if (userRole === 'SETTER') {
      // Pour l'instant, pas d'accès pour SETTER
      // Peut être étendu plus tard si nécessaire
      return false;
    }

    return false;
  }

  /**
   * Vérifie si un utilisateur peut accéder à un deal
   */
  async canAccessDeal(
    userId: string,
    userRole: string,
    organizationId: string,
    dealId: string,
  ): Promise<boolean> {
    // Si l'ownership check est désactivé, autoriser (comportement par défaut)
    if (!this.isOwnershipEnabled()) {
      return true;
    }

    // SUPER_ADMIN et ADMIN : accès full org
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      return true;
    }

    // MANAGER : accès full org
    if (userRole === 'MANAGER') {
      return true;
    }

    // Récupérer le deal avec ses relations
    const deal = await this.prisma.deal.findFirst({
      where: {
        id: dealId,
        organizationId,
      },
      select: {
        id: true,
        createdById: true,
        lead: {
          select: {
            id: true,
            assignedCloserId: true,
          },
        },
      },
    });

    if (!deal) {
      throw new NotFoundException('Deal non trouvé');
    }

    // CLOSER : lecture uniquement si ownerCloserId = user.id (via createdById) ou via lead.assignedCloserId
    if (userRole === 'CLOSER') {
      return deal.createdById === userId || deal.lead.assignedCloserId === userId;
    }

    // SETTER : pas d'accès aux deals (ou lecture limitée si déjà prévu)
    if (userRole === 'SETTER') {
      // Pour l'instant, pas d'accès pour SETTER
      return false;
    }

    return false;
  }

  /**
   * Helper générique pour vérifier l'accès à une ressource
   */
  async checkAccess(
    resourceType: ResourceType,
    userId: string,
    userRole: string,
    organizationId: string,
    resourceId: string,
  ): Promise<void> {
    let hasAccess = false;

    switch (resourceType) {
      case ResourceType.LEAD:
        hasAccess = await this.canAccessLead(userId, userRole, organizationId, resourceId);
        break;
      case ResourceType.APPOINTMENT:
        hasAccess = await this.canAccessAppointment(userId, userRole, organizationId, resourceId);
        break;
      case ResourceType.DEAL:
        hasAccess = await this.canAccessDeal(userId, userRole, organizationId, resourceId);
        break;
      default:
        throw new ForbiddenException('Type de ressource non supporté');
    }

    if (!hasAccess) {
      throw new ForbiddenException('Vous n\'avez pas accès à cette ressource');
    }
  }
}
