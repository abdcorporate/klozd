import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  SetMetadata,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto, AcceptInvitationDto } from './dto/invitations.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Permission } from '../auth/permissions/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BadRequestException } from '@nestjs/common';

const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.CREATE_USERS)
  async createInvitation(
    @CurrentUser() user: any,
    @Body() createDto: CreateInvitationDto,
  ) {
    // ADMIN et MANAGER peuvent inviter des utilisateurs
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      throw new BadRequestException('Seuls les ADMIN et les Managers peuvent inviter des utilisateurs dans leur organisation');
    }

    return this.invitationsService.createInvitation(
      user.organizationId,
      user.id,
      createDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.VIEW_USERS)
  async findAll(@CurrentUser() user: any) {
    // ADMIN et MANAGER peuvent voir les invitations
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      throw new BadRequestException('Seuls les ADMIN et les Managers peuvent voir les invitations');
    }

    return this.invitationsService.findAll(user.organizationId);
  }

  @Get('public/:token')
  @Public()
  async getInvitationByToken(@Param('token') token: string) {
    // Endpoint public (pas de guard) pour vérifier l'invitation
    return this.invitationsService.getInvitationByToken(token);
  }

  @Post('public/:token/accept')
  @Public()
  async acceptInvitation(
    @Param('token') token: string,
    @Body() acceptDto: AcceptInvitationDto,
  ) {
    // Endpoint public (pas de guard) pour accepter l'invitation
    return this.invitationsService.acceptInvitation(token, acceptDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  async cancelInvitation(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    // ADMIN et MANAGER peuvent annuler une invitation
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      throw new BadRequestException('Seuls les ADMIN et les Managers peuvent annuler des invitations');
    }

    return this.invitationsService.cancelInvitation(id, user.organizationId);
  }

  @Post(':id/resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  async resendInvitation(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    // ADMIN et MANAGER peuvent renvoyer une invitation
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      throw new BadRequestException('Seuls les ADMIN et les Managers peuvent renvoyer des invitations');
    }

    return this.invitationsService.resendInvitation(id, user.organizationId);
  }
}

