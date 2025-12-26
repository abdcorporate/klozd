import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrganizationDto } from './dto/organizations.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère toutes les organisations (SUPER_ADMIN uniquement)
   */
  async findAll() {
    try {
      return await this.prisma.organization.findMany({
        include: {
          _count: {
            select: {
              users: true,
            },
          },
          settings: {
            select: {
              subscriptionPlan: true,
              monthlyPrice: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('[OrganizationsService] Error in findAll:', error);
      throw error;
    }
  }

  /**
   * Récupère une organisation par son ID (SUPER_ADMIN uniquement)
   */
  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
        settings: {
          select: {
            subscriptionPlan: true,
            monthlyPrice: true,
            maxUsers: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organisation non trouvée');
    }

    return organization;
  }

  /**
   * Met à jour une organisation (SUPER_ADMIN uniquement)
   */
  async update(id: string, updateDto: UpdateOrganizationDto) {
    console.log('[OrganizationsService] Update called:', { id, updateDto });
    
    // Vérifier que l'organisation existe
    await this.findOne(id);

    // Nettoyer les données : supprimer les champs undefined/null vides
    const cleanData: any = {};
    if (updateDto.name !== undefined && updateDto.name !== null && updateDto.name !== '') {
      cleanData.name = updateDto.name;
    }
    if (updateDto.slug !== undefined && updateDto.slug !== null && updateDto.slug !== '') {
      cleanData.slug = updateDto.slug;
    }
    if (updateDto.timezone !== undefined && updateDto.timezone !== null && updateDto.timezone !== '') {
      cleanData.timezone = updateDto.timezone;
    }
    if (updateDto.currency !== undefined && updateDto.currency !== null && updateDto.currency !== '') {
      cleanData.currency = updateDto.currency;
    }

    // Si aucun champ à mettre à jour, retourner l'organisation actuelle
    if (Object.keys(cleanData).length === 0) {
      console.log('[OrganizationsService] No fields to update');
      return this.findOne(id);
    }

    // Si le slug est modifié, vérifier qu'il n'existe pas déjà
    if (cleanData.slug) {
      const existingOrg = await this.prisma.organization.findFirst({
        where: {
          slug: cleanData.slug,
          id: { not: id },
        },
      });

      if (existingOrg) {
        throw new BadRequestException('Ce slug est déjà utilisé par une autre organisation');
      }
    }

    console.log('[OrganizationsService] Updating with data:', cleanData);
    
    const result = await this.prisma.organization.update({
      where: { id },
      data: cleanData,
      include: {
        _count: {
          select: {
            users: true,
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

    console.log('[OrganizationsService] Update result:', result);
    return result;
  }

  /**
   * Supprime une organisation (SUPER_ADMIN uniquement)
   */
  async remove(id: string) {
    console.log('[OrganizationsService] remove called with id:', id);
    
    // Vérifier que l'organisation existe
    const organization = await this.findOne(id);
    console.log('[OrganizationsService] Organization found:', organization.name);

    // Vérifier qu'il n'y a pas d'utilisateurs (sécurité)
    const userCount = await this.prisma.user.count({
      where: { organizationId: id },
    });

    console.log('[OrganizationsService] User count:', userCount);

    if (userCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer l'organisation : elle contient ${userCount} utilisateur(s). Supprimez d'abord les utilisateurs.`,
      );
    }

    console.log('[OrganizationsService] Starting deletion transaction...');

    // Utiliser une transaction pour supprimer toutes les données liées
    return this.prisma.$transaction(async (tx) => {
      // Supprimer toutes les données liées dans l'ordre correct
      // (même si onDelete: Cascade devrait le faire, on le fait explicitement pour éviter les problèmes)

      // 1. Supprimer les settings
      await tx.organizationSettings.deleteMany({
        where: { organizationId: id },
      });

      // 3. Supprimer les forms (et leurs relations en cascade)
      await tx.form.deleteMany({
        where: { organizationId: id },
      });

      // 4. Supprimer les CallParticipants (qui dépendent des Calls)
      await tx.callParticipant.deleteMany({
        where: {
          call: {
            organizationId: id,
          },
        },
      });

      // 5. Supprimer les calls (et leurs relations en cascade)
      await tx.call.deleteMany({
        where: { organizationId: id },
      });

      // 6. Supprimer les appointments (qui dépendent des Leads)
      await tx.appointment.deleteMany({
        where: {
          lead: {
            organizationId: id,
          },
        },
      });

      // 7. Supprimer les AIPredictions (qui dépendent des Leads)
      await tx.aIPrediction.deleteMany({
        where: {
          lead: {
            organizationId: id,
          },
        },
      });

      // 8. Supprimer les deals (et leurs relations en cascade)
      await tx.deal.deleteMany({
        where: { organizationId: id },
      });

      // 9. Supprimer les leads (et leurs relations en cascade)
      await tx.lead.deleteMany({
        where: { organizationId: id },
      });

      // 10. Enfin, supprimer l'organisation
      const deleted = await tx.organization.delete({
        where: { id },
      });
      
      console.log('[OrganizationsService] Organization deleted successfully:', deleted.id);
      return deleted;
    });
  }
}

