import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequireRoles } from '../../auth/decorators/require-roles.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Admin - Waitlist')
@Controller('admin/waitlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminWaitlistController {
  private readonly logger = new Logger(AdminWaitlistController.name);

  constructor(private prisma: PrismaService) {}

  @Get()
  @RequireRoles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Liste paginée des entrées de la waitlist (SUPER_ADMIN uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des entrées de la waitlist',
  })
  async getWaitlistEntries(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('search') search?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    try {
      // Construire la condition de recherche
      const where: any = {};
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Compter le total
      // Note: Using direct Prisma client access after regeneration
      const total = await this.prisma.waitlistEntry.count({ where });

      // Récupérer les entrées
      const entries = await this.prisma.waitlistEntry.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      });

      return {
        data: entries,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    } catch (error: any) {
      this.logger.error(`Error fetching waitlist entries: ${error.message}`, error.stack);
      throw new HttpException(
        'Erreur lors de la récupération des entrées de la waitlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  @RequireRoles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Statistiques de la waitlist (SUPER_ADMIN uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques de la waitlist',
  })
  async getWaitlistStats() {
    try {
      const total = await this.prisma.waitlistEntry.count();

      // Statistiques par rôle
      const byRole = await this.prisma.waitlistEntry.groupBy({
        by: ['role'],
        _count: { role: true },
        where: { role: { not: null } },
      });

      // Statistiques par volume de leads
      const byLeadVolume = await this.prisma.waitlistEntry.groupBy({
        by: ['leadVolumeRange'],
        _count: { leadVolumeRange: true },
        where: { leadVolumeRange: { not: null } },
      });

      // Statistiques par source UTM
      const byUtmSource = await this.prisma.waitlistEntry.groupBy({
        by: ['utmSource'],
        _count: { utmSource: true },
        where: { utmSource: { not: null } },
      });

      // Entrées des 7 derniers jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentCount = await this.prisma.waitlistEntry.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      });

      return {
        total,
        recent: recentCount,
        byRole: byRole.map((item: any) => ({
          role: item.role,
          count: item._count.role,
        })),
        byLeadVolume: byLeadVolume.map((item: any) => ({
          range: item.leadVolumeRange,
          count: item._count.leadVolumeRange,
        })),
        byUtmSource: byUtmSource.map((item: any) => ({
          source: item.utmSource,
          count: item._count.utmSource,
        })),
      };
    } catch (error: any) {
      this.logger.error(`Error fetching waitlist stats: ${error.message}`, error.stack);
      throw new HttpException(
        'Erreur lors de la récupération des statistiques de la waitlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
