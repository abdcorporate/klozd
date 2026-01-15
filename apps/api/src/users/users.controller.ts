import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Query,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permission } from '../auth/permissions/permissions';
import { PaginationQueryDto, PaginatedResponse } from '../common/pagination';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IpDetectionService } from '../common/services/ip-detection.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ipDetectionService: IpDetectionService,
  ) {}

  @Post()
  @RequirePermissions(Permission.MANAGE_USERS)
  create(@CurrentUser() user: any, @Body() createUserDto: CreateUserDto, @Req() req: any) {
    const reqMeta = {
      ip: this.ipDetectionService.getClientIp(req),
      userAgent: req.headers['user-agent'],
    };
    return this.usersService.create(user.organizationId, user.role, createUserDto, user.id, reqMeta);
  }

  @Get()
  @Throttle({ default: { limit: 500, ttl: 60000 } }) // 500 requêtes par minute pour GET /users
  @RequirePermissions(Permission.VIEW_USERS)
  @ApiOperation({ summary: 'Récupérer la liste des utilisateurs avec pagination par curseur' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre maximum d\'éléments (1-100, défaut: 25)' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Curseur de pagination (base64)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Champ de tri (défaut: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Ordre de tri (défaut: desc)' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Terme de recherche' })
  @ApiResponse({ status: 200, description: 'Liste paginée des utilisateurs', type: PaginatedResponse })
  async findAll(
    @CurrentUser() user: any,
    @Query() pagination: PaginationQueryDto,
  ) {
    // Extraire les filtres de pagination
    const { limit, cursor, sortBy, sortOrder, q } = pagination;
    const paginationDto: PaginationQueryDto = {
      limit: limit ? Number(limit) : undefined,
      cursor,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
      q,
    };

    return this.usersService.findAll(user.organizationId, user.role, paginationDto, user.id);
  }

  @Get(':id')
  @RequirePermissions(Permission.VIEW_USERS)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.findOne(id, user.organizationId, user.role);
  }

  @Patch(':id')
  @RequirePermissions(Permission.MANAGE_USERS)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    const reqMeta = {
      ip: this.ipDetectionService.getClientIp(req),
      userAgent: req.headers['user-agent'],
    };
    return this.usersService.update(id, user.organizationId, user.role, updateUserDto, user.id, reqMeta);
  }

  @Delete(':id')
  @RequirePermissions(Permission.MANAGE_USERS)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    // Empêcher la suppression de soi-même
    if (user.id === id) {
      throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte');
    }
    return this.usersService.remove(id, user.organizationId, user.role);
  }

  @Post(':id/activate')
  @RequirePermissions(Permission.ACTIVATE_USER)
  activate(@CurrentUser() user: any, @Param('id') id: string, @Req() req: any) {
    const reqMeta = {
      ip: this.ipDetectionService.getClientIp(req),
      userAgent: req.headers['user-agent'],
    };
    return this.usersService.activate(id, user.organizationId, user.role, user.id, reqMeta);
  }

  @Post(':id/deactivate')
  @RequirePermissions(Permission.DEACTIVATE_USER)
  deactivate(@CurrentUser() user: any, @Param('id') id: string, @Req() req: any) {
    const reqMeta = {
      ip: this.ipDetectionService.getClientIp(req),
      userAgent: req.headers['user-agent'],
    };
    return this.usersService.deactivate(id, user.organizationId, user.role, user.id, reqMeta);
  }
}

