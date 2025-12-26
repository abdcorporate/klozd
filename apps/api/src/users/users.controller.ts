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
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permission } from '../auth/permissions/permissions';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions(Permission.MANAGE_USERS)
  create(@CurrentUser() user: any, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create(user.organizationId, user.role, createUserDto);
  }

  @Get()
  @Throttle({ default: { limit: 500, ttl: 60000 } }) // 500 requêtes par minute pour GET /users
  @RequirePermissions(Permission.VIEW_USERS)
  async findAll(@CurrentUser() user: any) {
    console.log('[UsersController] findAll - User:', { id: user.id, role: user.role, organizationId: user.organizationId });
    try {
      const result = await this.usersService.findAll(user.organizationId, user.role, user.id);
      console.log('[UsersController] findAll - Résultat:', Array.isArray(result) ? `${result.length} utilisateurs` : result);
      return result;
    } catch (error) {
      console.error('[UsersController] findAll - Erreur:', error);
      throw error;
    }
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
  ) {
    return this.usersService.update(id, user.organizationId, user.role, updateUserDto);
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
  activate(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.activate(id, user.organizationId, user.role);
  }

  @Post(':id/deactivate')
  @RequirePermissions(Permission.DEACTIVATE_USER)
  deactivate(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.deactivate(id, user.organizationId, user.role);
  }
}

