import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { SchedulingService } from './scheduling.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/scheduling.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireOwnership } from '../auth/decorators/require-ownership.decorator';
import { ResourceType } from '../auth/policies/ownership-policy.service';
import { PaginationQueryDto, PaginatedResponse } from '../common/pagination';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IdempotencyService } from '../common/services/idempotency.service';
import { IpDetectionService } from '../common/services/ip-detection.service';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarIcsService } from '../notifications/services/calendar-ics.service';

@ApiTags('Scheduling')
@Controller('scheduling')
export class SchedulingController {
  constructor(
    private readonly schedulingService: SchedulingService,
    private readonly idempotencyService: IdempotencyService,
    private readonly ipDetectionService: IpDetectionService,
    private readonly prisma: PrismaService,
    private readonly calendarIcsService: CalendarIcsService,
  ) {}

  @Post('appointments')
  @UseGuards(JwtAuthGuard)
  createAppointment(
    @CurrentUser() user: any,
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() req: any,
  ) {
    const reqMeta = {
      ip: this.ipDetectionService.getClientIp(req),
      userAgent: req.headers['user-agent'],
    };
    return this.schedulingService.createAppointment(
      user.organizationId,
      createAppointmentDto.leadId,
      createAppointmentDto,
      user.id,
      reqMeta,
    );
  }

  @Get('appointments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer la liste des rendez-vous avec pagination par curseur' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre maximum d\'éléments (1-100, défaut: 25)' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Curseur de pagination (base64)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Champ de tri (défaut: scheduledAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Ordre de tri (défaut: asc)' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Terme de recherche' })
  @ApiResponse({ status: 200, description: 'Liste paginée des rendez-vous', type: PaginatedResponse })
  findAll(
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

    return this.schedulingService.findAll(
      user.organizationId,
      user.id,
      user.role,
      paginationDto,
      otherFilters,
    );
  }

  @Get('appointments/:id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @RequireOwnership(ResourceType.APPOINTMENT)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.schedulingService.findOne(id, user.organizationId);
  }

  @Patch('appointments/:id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @RequireOwnership(ResourceType.APPOINTMENT)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Req() req: any,
  ) {
    const reqMeta = {
      ip: this.ipDetectionService.getClientIp(req),
      userAgent: req.headers['user-agent'],
    };
    return this.schedulingService.update(id, user.organizationId, updateAppointmentDto, user.id, reqMeta);
  }

  @Post('appointments/:id/complete')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @RequireOwnership(ResourceType.APPOINTMENT)
  markCompleted(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('outcome') outcome: string,
    @Req() req: any,
  ) {
    const reqMeta = {
      ip: this.ipDetectionService.getClientIp(req),
      userAgent: req.headers['user-agent'],
    };
    return this.schedulingService.markCompleted(id, user.organizationId, outcome, user.id, reqMeta);
  }

  @Post('appointments/:id/no-show')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @RequireOwnership(ResourceType.APPOINTMENT)
  markNoShow(@CurrentUser() user: any, @Param('id') id: string, @Req() req: any) {
    const reqMeta = {
      ip: this.ipDetectionService.getClientIp(req),
      userAgent: req.headers['user-agent'],
    };
    return this.schedulingService.markNoShow(id, user.organizationId, user.id, reqMeta);
  }

  // Endpoints publics pour la réservation
  @Get('availability/:closerId')
  getAvailability(@Param('closerId') closerId: string) {
    return this.schedulingService.getAvailability(closerId);
  }

  @Post('appointments/public')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async createPublicAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: any,
  ) {
    const route = '/scheduling/appointments/public';
    const ip = this.ipDetectionService.getClientIp(req);

    // Get organizationId from lead before processing
    // We need to check the lead exists anyway, so do it early
    const lead = await this.prisma.lead.findUnique({
      where: { id: createAppointmentDto.leadId },
      select: { organizationId: true },
    });

    if (!lead) {
      throw new NotFoundException('Lead non trouvé');
    }

    const organizationId = lead.organizationId;

    // Check idempotency if key provided
    if (idempotencyKey) {
      const stored = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        route,
        createAppointmentDto,
        organizationId,
      );

      if (stored) {
        // Return stored response
        return stored.body;
      }
    }

    // Process request
    const result = await this.schedulingService.createPublicAppointment(createAppointmentDto);

    // Store idempotency record if key provided
    if (idempotencyKey) {
      await this.idempotencyService.storeResponse(
        idempotencyKey,
        route,
        createAppointmentDto,
        HttpStatus.CREATED,
        result,
        organizationId,
      );
    }

    return result;
  }

  // Endpoint public pour télécharger le fichier .ics
  @Get('appointments/:id/calendar.ics')
  async downloadCalendarFile(@Param('id') appointmentId: string, @Res() res: Response) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        lead: true,
        assignedCloser: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Rendez-vous non trouvé');
    }

    const closerName = `${appointment.assignedCloser.firstName} ${appointment.assignedCloser.lastName}`;
    const description = `Rendez-vous avec ${closerName}${appointment.visioUrl ? `\nLien visio: ${appointment.visioUrl}` : ''}`;
    
    const icsContent = this.calendarIcsService.generateIcsFile(
      `Rendez-vous avec ${closerName}`,
      description,
      appointment.scheduledAt,
      appointment.duration,
      appointment.visioUrl || undefined,
      appointment.assignedCloser.email || undefined,
      appointment.lead.email || undefined,
    );

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="rendez-vous-${appointmentId}.ics"`);
    res.send(icsContent);
  }
}


