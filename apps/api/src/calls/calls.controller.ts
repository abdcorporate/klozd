import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { CallsService } from './calls.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JoinCallDto, StartCallDto, StopCallDto, LivekitWebhookDto } from './dto/calls.dto';
import { UserRole } from '@prisma/client';

@Controller('calls')
@UseGuards(JwtAuthGuard)
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post('appointments/:appointmentId/join-call')
  async joinCall(
    @CurrentUser() user: any,
    @Param('appointmentId') appointmentId: string,
    @Body() joinCallDto?: JoinCallDto,
  ) {
    // Vérifier les rôles autorisés
    const allowedRoles: UserRole[] = ['ADMIN', 'MANAGER', 'CLOSER', 'SETTER', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Vous n\'avez pas la permission de rejoindre un call');
    }

    return this.callsService.joinCall(
      appointmentId,
      user.id,
      user.role,
      user.organizationId,
      joinCallDto,
    );
  }

  @Post(':id/start')
  async startCall(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() startCallDto?: StartCallDto,
  ) {
    return this.callsService.startCall(id, user.organizationId, user.id, startCallDto);
  }

  @Post(':id/stop')
  async stopCall(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() stopCallDto?: StopCallDto,
  ) {
    return this.callsService.stopCall(id, user.organizationId, user.id, stopCallDto);
  }

  @Get(':id')
  async getCall(@CurrentUser() user: any, @Param('id') id: string) {
    return this.callsService.getCall(id, user.organizationId);
  }
}

// Webhook public pour LiveKit (protégé par signature)
@Controller('webhooks')
export class CallsWebhookController {
  constructor(private readonly callsService: CallsService) {}

  @Post('livekit')
  async handleLivekitWebhook(@Body() payload: LivekitWebhookDto) {
    // TODO: Vérifier la signature HMAC du webhook
    // Pour l'instant, on accepte sans vérification (à sécuriser en production)
    return this.callsService.handleLivekitWebhook(payload);
  }
}

