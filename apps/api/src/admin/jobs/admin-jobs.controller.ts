import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJobsService } from './admin-jobs.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PaginationQueryDto, PaginatedResponse } from '../../common/pagination';

@ApiTags('Admin - Jobs')
@ApiBearerAuth()
@Controller('admin/jobs')
@UseGuards(JwtAuthGuard)
export class AdminJobsController {
  constructor(private readonly adminJobsService: AdminJobsService) {}

  @Get('failed')
  @ApiOperation({
    summary: 'Récupérer la liste des jobs échoués (DLQ)',
    description: 'Liste paginée des jobs échoués. Accessible uniquement aux ADMIN et SUPER_ADMIN.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre maximum d\'éléments (1-100, défaut: 50)' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Curseur de pagination (base64)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Champ de tri (défaut: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Ordre de tri (défaut: desc)' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Recherche dans jobName et errorMessage' })
  @ApiQuery({ name: 'queueName', required: false, type: String, description: 'Filtrer par nom de queue (exact match)' })
  @ApiResponse({ status: 200, description: 'Liste paginée des jobs échoués', type: PaginatedResponse })
  @ApiResponse({ status: 403, description: 'Accès refusé (rôle insuffisant)' })
  async getFailedJobs(
    @CurrentUser() user: any,
    @Query() pagination: PaginationQueryDto,
    @Query('queueName') queueName?: string,
  ) {
    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Vérifier le rôle
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Seuls les administrateurs peuvent consulter les jobs échoués');
    }

    return this.adminJobsService.getFailedJobs(user.role, pagination, queueName);
  }

  @Delete('failed/:id')
  @ApiOperation({
    summary: 'Supprimer un job échoué',
    description: 'Supprime un job échoué de la base de données. Accessible uniquement aux ADMIN et SUPER_ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'ID du job échoué à supprimer' })
  @ApiResponse({ status: 200, description: 'Job échoué supprimé avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé (rôle insuffisant)' })
  @ApiResponse({ status: 404, description: 'Job échoué non trouvé' })
  async deleteFailedJob(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Vérifier le rôle
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Seuls les administrateurs peuvent supprimer les jobs échoués');
    }

    await this.adminJobsService.deleteFailedJob(user.role, id);
    return { message: 'Job échoué supprimé avec succès' };
  }
}
