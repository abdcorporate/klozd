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
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SchedulingService } from './scheduling.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/scheduling.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationQueryDto, PaginatedResponse } from '../common/pagination';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IdempotencyService } from '../common/services/idempotency.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Scheduling')
@Controller('scheduling')
export class SchedulingController {
  constructor(
    private readonly schedulingService: SchedulingService,
    private readonly idempotencyService: IdempotencyService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('appointments')
  @UseGuards(JwtAuthGuard)
  createAppointment(
    @CurrentUser() user: any,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.schedulingService.createAppointment(
      user.organizationId,
      createAppointmentDto.leadId,
      createAppointmentDto,
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
  @UseGuards(JwtAuthGuard)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.schedulingService.findOne(id, user.organizationId);
  }

  @Patch('appointments/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.schedulingService.update(id, user.organizationId, updateAppointmentDto);
  }

  @Post('appointments/:id/complete')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  markCompleted(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('outcome') outcome: string,
  ) {
    return this.schedulingService.markCompleted(id, user.organizationId, outcome);
  }

  @Post('appointments/:id/no-show')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  markNoShow(@CurrentUser() user: any, @Param('id') id: string) {
    return this.schedulingService.markNoShow(id, user.organizationId);
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
    const ip = req.ip || req.connection?.remoteAddress;

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
        ip,
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
        ip,
      );
    }

    return result;
  }
}


