import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../auth/decorators/require-roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuditLogService } from '../../common/services/audit-log.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PaginationQueryDto, PaginatedResponse } from '../../common/pagination';

@ApiTags('Admin - Audit Logs')
@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('ADMIN', 'SUPER_ADMIN')
export class AdminAuditLogsController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer les logs d\'audit avec pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre maximum d\'éléments (1-100, défaut: 25)' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Curseur de pagination (base64)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Champ de tri (défaut: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Ordre de tri (défaut: desc)' })
  @ApiQuery({ name: 'entityType', required: false, type: String, description: 'Filtrer par type d\'entité (LEAD, FORM, APPOINTMENT, USER, SETTINGS)' })
  @ApiQuery({ name: 'entityId', required: false, type: String, description: 'Filtrer par ID d\'entité' })
  @ApiQuery({ name: 'action', required: false, type: String, description: 'Filtrer par action (CREATE, UPDATE, DELETE, ASSIGN, QUALIFY, etc.)' })
  @ApiQuery({ name: 'actorUserId', required: false, type: String, description: 'Filtrer par ID de l\'acteur' })
  @ApiResponse({ status: 200, description: 'Liste paginée des logs d\'audit', type: PaginatedResponse })
  async getAuditLogs(
    @CurrentUser() user: any,
    @Query() pagination: PaginationQueryDto,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('actorUserId') actorUserId?: string,
  ) {
    const { limit, cursor, sortBy, sortOrder } = pagination;

    const filters: any = {};
    if (entityType) filters.entityType = entityType;
    if (entityId) filters.entityId = entityId;
    if (action) filters.action = action;
    if (actorUserId) filters.actorUserId = actorUserId;

    return this.auditLogService.getAuditLogs(
      user.organizationId,
      filters,
      {
        limit: limit ? Number(limit) : undefined,
        cursor,
        sortBy: sortBy || 'createdAt',
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      },
    );
  }
}
