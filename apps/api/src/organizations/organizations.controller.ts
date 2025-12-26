import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from './dto/organizations.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permission } from '../auth/permissions/permissions';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @RequirePermissions(Permission.VIEW_ALL_USERS) // Seul le SUPER_ADMIN a cette permission
  findAll(@CurrentUser() user: any) {
    // Vérifier que c'est bien un SUPER_ADMIN
    if (user.role !== 'SUPER_ADMIN') {
      throw new BadRequestException('Seuls les administrateurs peuvent accéder à cette ressource');
    }
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @RequirePermissions(Permission.VIEW_ALL_USERS)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    if (user.role !== 'SUPER_ADMIN') {
      throw new BadRequestException('Seuls les administrateurs peuvent accéder à cette ressource');
    }
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.MANAGE_ORGANIZATION)
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateDto: UpdateOrganizationDto) {
    if (user.role !== 'SUPER_ADMIN') {
      throw new BadRequestException('Seuls les administrateurs peuvent modifier les organisations');
    }
    try {
      console.log('[OrganizationsController] Update request:', { id, updateDto, userId: user.id });
      const result = await this.organizationsService.update(id, updateDto);
      console.log('[OrganizationsController] Update success:', result);
      return result;
    } catch (error: any) {
      console.error('[OrganizationsController] Update error:', error);
      throw error;
    }
  }

  @Delete(':id')
  @RequirePermissions(Permission.MANAGE_ORGANIZATION)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    console.log('[OrganizationsController] DELETE request:', { id, userId: user.id, userRole: user.role });
    
    if (user.role !== 'SUPER_ADMIN') {
      throw new BadRequestException('Seuls les administrateurs peuvent supprimer les organisations');
    }
    try {
      const result = await this.organizationsService.remove(id);
      console.log('[OrganizationsController] Delete success:', result);
      return { message: 'Organisation supprimée avec succès', ...result };
    } catch (error: any) {
      // Logger l'erreur pour le débogage
      console.error('[OrganizationsController] Delete error:', error);
      console.error('[OrganizationsController] Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
      });
      throw error;
    }
  }
}

