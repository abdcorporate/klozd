import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from '../../settings/pricing.service';

@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.organizationId) {
      return false;
    }

    // Récupérer les settings de l'organisation
    const settings = await this.prisma.organizationSettings.findUnique({
      where: { organizationId: user.organizationId },
    });

    if (!settings) {
      return true; // Pas de settings = pas de limite
    }

    // Vérifier les quotas selon le type de ressource
    const resourceType = request.route?.path?.includes('/users') ? 'users' :
                         request.route?.path?.includes('/forms') ? 'forms' :
                         request.route?.path?.includes('/leads') ? 'leads' :
                         null;

    if (resourceType === 'users') {
      const currentUserCount = await this.prisma.user.count({
        where: { organizationId: user.organizationId, status: 'ACTIVE' },
      });

      if (currentUserCount >= settings.maxUsers) {
        throw new ForbiddenException(
          `Quota d'utilisateurs atteint (${settings.maxUsers}). Veuillez passer à un plan supérieur.`,
        );
      }
    }

    if (resourceType === 'forms') {
      const currentFormCount = await this.prisma.form.count({
        where: { organizationId: user.organizationId },
      });

      if (currentFormCount >= settings.maxForms) {
        throw new ForbiddenException(
          `Quota de formulaires atteint (${settings.maxForms}). Veuillez passer à un plan supérieur.`,
        );
      }
    }

    if (resourceType === 'leads') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const currentLeadsCount = await this.prisma.lead.count({
        where: {
          organizationId: user.organizationId,
          createdAt: { gte: startOfMonth },
        },
      });

      if (currentLeadsCount >= settings.maxLeadsPerMonth) {
        throw new ForbiddenException(
          `Quota de leads mensuel atteint (${settings.maxLeadsPerMonth}). Veuillez passer à un plan supérieur.`,
        );
      }
    }

    return true;
  }
}




