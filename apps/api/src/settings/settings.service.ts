import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrganizationSettingsDto } from './dto/settings.dto';
import { PricingService } from './pricing.service';
import { AuditLogService } from '../common/services/audit-log.service';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
    private auditLogService: AuditLogService,
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

  async updateSettings(organizationId: string, updateDto: UpdateOrganizationSettingsDto, userId?: string, reqMeta?: { ip?: string; userAgent?: string }) {
    const existing = await this.prisma.organizationSettings.findUnique({
      where: { organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Paramètres non trouvés');
    }

    // Sauvegarder l'état avant pour l'audit log
    const beforeState = {
      subscriptionPlan: existing.subscriptionPlan,
      monthlyPrice: existing.monthlyPrice,
      maxUsers: existing.maxUsers,
      maxForms: existing.maxForms,
      maxLeadsPerMonth: existing.maxLeadsPerMonth,
    };

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

    const updated = await this.prisma.organizationSettings.update({
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

    // Audit log
    await this.auditLogService.logChange({
      actor: userId ? { id: userId } : null,
      orgId: organizationId,
      action: 'UPDATE',
      entityType: 'SETTINGS',
      entityId: organizationId,
      before: beforeState,
      after: {
        subscriptionPlan: updated.subscriptionPlan,
        monthlyPrice: updated.monthlyPrice,
        maxUsers: updated.maxUsers,
        maxForms: updated.maxForms,
        maxLeadsPerMonth: updated.maxLeadsPerMonth,
      },
      reqMeta,
    });

    return updated;
  }

  async updateOrganization(organizationId: string, data: { name?: string; logoUrl?: string; timezone?: string; currency?: string }, userId?: string, reqMeta?: { ip?: string; userAgent?: string }) {
    // Récupérer l'état avant pour l'audit log
    const beforeOrg = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    const updated = await this.prisma.organization.update({
      where: { id: organizationId },
      data,
    });

    // Audit log
    await this.auditLogService.logChange({
      actor: userId ? { id: userId } : null,
      orgId: organizationId,
      action: 'UPDATE',
      entityType: 'SETTINGS',
      entityId: organizationId,
      before: {
        name: beforeOrg?.name,
        logoUrl: beforeOrg?.logoUrl,
        timezone: beforeOrg?.timezone,
        currency: beforeOrg?.currency,
      },
      after: {
        name: updated.name,
        logoUrl: updated.logoUrl,
        timezone: updated.timezone,
        currency: updated.currency,
      },
      reqMeta,
    });

    return updated;
  }
}

