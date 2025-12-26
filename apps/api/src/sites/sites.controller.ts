import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDto, UpdateSiteDto } from './dto/sites.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  // Endpoint public pour récupérer un site par slug (sans authentification)
  @Get('public/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.sitesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() createSiteDto: CreateSiteDto) {
    // SUPER_ADMIN et ADMIN peuvent créer des sites
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      throw new UnauthorizedException('Seuls les administrateurs peuvent créer des sites');
    }

    if (!user || !user.organizationId) {
      throw new UnauthorizedException('Utilisateur non authentifié ou organisation manquante');
    }

    return this.sitesService.create(user.organizationId, createSiteDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: any) {
    if (!user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    // SUPER_ADMIN peut voir tous les sites (toutes les organisations)
    if (user.role === 'SUPER_ADMIN') {
      return this.sitesService.findAllForAdmin();
    }

    // ADMIN peut voir les sites de son organisation
    if (user.role === 'ADMIN') {
      if (!user.organizationId) {
        throw new UnauthorizedException('Organisation manquante');
      }
      return this.sitesService.findAll(user.organizationId);
    }

    // Les autres rôles ne peuvent pas accéder aux sites
    throw new UnauthorizedException('Seuls les administrateurs peuvent accéder aux sites');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    if (!user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    // SUPER_ADMIN peut voir tous les sites
    if (user.role === 'SUPER_ADMIN') {
      return this.sitesService.findOne(id);
    }

    // ADMIN peut voir les sites de son organisation
    if (user.role === 'ADMIN') {
      if (!user.organizationId) {
        throw new UnauthorizedException('Organisation manquante');
      }
      return this.sitesService.findOne(id, user.organizationId);
    }

    // Les autres rôles ne peuvent pas accéder aux sites
    throw new UnauthorizedException('Seuls les administrateurs peuvent accéder aux sites');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateSiteDto: UpdateSiteDto,
  ) {
    // SUPER_ADMIN et ADMIN peuvent modifier des sites
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      throw new UnauthorizedException('Seuls les administrateurs peuvent modifier des sites');
    }

    if (!user || !user.organizationId) {
      throw new UnauthorizedException('Utilisateur non authentifié ou organisation manquante');
    }

    return this.sitesService.update(id, user.organizationId, updateSiteDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    // SUPER_ADMIN et ADMIN peuvent supprimer des sites
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      throw new UnauthorizedException('Seuls les administrateurs peuvent supprimer des sites');
    }

    if (!user || !user.organizationId) {
      throw new UnauthorizedException('Utilisateur non authentifié ou organisation manquante');
    }

    return this.sitesService.remove(id, user.organizationId);
  }
}

