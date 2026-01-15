import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateDealDto, UpdateDealDto } from './dto/crm.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireOwnership } from '../auth/decorators/require-ownership.decorator';
import { ResourceType } from '../auth/policies/ownership-policy.service';
import { PaginationQueryDto, PaginatedResponse } from '../common/pagination';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('CRM')
@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post('deals')
  createDeal(@CurrentUser() user: any, @Body() createDealDto: CreateDealDto) {
    return this.crmService.createDeal(user.organizationId, user.id, createDealDto);
  }

  @Get('deals')
  @ApiOperation({ summary: 'Récupérer la liste des deals avec pagination par curseur' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre maximum d\'éléments (1-100, défaut: 25)' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Curseur de pagination (base64)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Champ de tri (défaut: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Ordre de tri (défaut: desc)' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Terme de recherche' })
  @ApiResponse({ status: 200, description: 'Liste paginée des deals', type: PaginatedResponse })
  findAllDeals(
    @CurrentUser() user: any,
    @Query() pagination: PaginationQueryDto,
    @Query() filters: any,
  ) {
    // Extraire les filtres de pagination
    const { limit, cursor, sortBy, sortOrder, q, ...otherFilters } = filters;
    const paginationDto: PaginationQueryDto = {
      limit: limit ? Number(limit) : undefined,
      cursor,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
      q,
    };

    return this.crmService.findAllDeals(
      user.organizationId,
      user.id,
      user.role,
      paginationDto,
      otherFilters,
    );
  }

  @Get('pipeline')
  getPipeline(@CurrentUser() user: any) {
    return this.crmService.getPipeline(user.organizationId, user.id, user.role);
  }

  @Patch('deals/:id')
  @UseGuards(OwnershipGuard)
  @RequireOwnership(ResourceType.DEAL)
  updateDeal(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
  ) {
    return this.crmService.updateDeal(id, user.organizationId, updateDealDto);
  }
}


