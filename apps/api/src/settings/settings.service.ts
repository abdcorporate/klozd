import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrganizationSettingsDto } from './dto/settings.dto';
import { PricingService } from './pricing.service';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
  ) {}

  async getSettings(organizationId: string) {
    try {
      const settings = await this.prisma.organizationSettings.findUnique({
        where: { organizationId },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              timezone: true,
              currency: true,
            },
          },
        },
      });

      if (!settings) {
        // Créer les settings par défaut si elles n'existent pas
        return this.prisma.organizationSettings.create({
          data: {
            organizationId,
            callRecordingEnabled: true, // Valeur par défaut
          },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                timezone: true,
                currency: true,
              },
            },
          },
        });
      }

      // S'assurer que callRecordingEnabled existe (pour les anciennes organisations)
      if (settings.callRecordingEnabled === null || settings.callRecordingEnabled === undefined) {
        return this.prisma.organizationSettings.update({
          where: { organizationId },
          data: {
            callRecordingEnabled: true,
          },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                timezone: true,
                currency: true,
              },
            },
          },
        });
      }

      return settings;
    } catch (error: any) {
      console.error('Erreur dans getSettings:', error);
      throw error;
    }
  }

  async updateSettings(organizationId: string, updateDto: UpdateOrganizationSettingsDto) {
    const existing = await this.prisma.organizationSettings.findUnique({
      where: { organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Paramètres non trouvés');
    }

    // Si le plan change, appliquer les quotas et prix du nouveau plan
    let updateData: any = {
      ...updateDto,
      billingAddress: updateDto.billingAddress
        ? JSON.stringify(updateDto.billingAddress)
        : undefined,
    };

    if (updateDto.subscriptionPlan && updateDto.subscriptionPlan !== existing.subscriptionPlan) {
      const planFeatures = this.pricingService.getPlanFeatures(updateDto.subscriptionPlan);
      const plan = this.pricingService.getPlan(updateDto.subscriptionPlan);

      if (!plan) {
        throw new BadRequestException(`Plan invalide: ${updateDto.subscriptionPlan}`);
      }

      // Appliquer les quotas et prix du nouveau plan
      updateData = {
        ...updateData,
        monthlyPrice: plan.monthlyPrice,
        maxUsers: planFeatures.maxUsers,
        maxForms: planFeatures.maxForms,
        maxLeadsPerMonth: planFeatures.maxLeadsPerMonth,
        maxAppointmentsPerMonth: planFeatures.maxAppointmentsPerMonth,
        maxSmsPerMonth: planFeatures.maxSmsPerMonth,
        aiEnabled: planFeatures.aiEnabled,
        whatsappEnabled: planFeatures.whatsappEnabled,
        smsEnabled: planFeatures.smsEnabled,
      };
    }

    return this.prisma.organizationSettings.update({
      where: { organizationId },
      data: updateData,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            timezone: true,
            currency: true,
          },
        },
      },
    });
  }

  async updateOrganization(organizationId: string, data: { name?: string; logoUrl?: string; timezone?: string; currency?: string }) {
    return this.prisma.organization.update({
      where: { id: organizationId },
      data,
    });
  }
}

