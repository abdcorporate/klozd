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
import { SchedulingService } from './scheduling.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/scheduling.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

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
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.schedulingService.findAll(
      user.organizationId,
      user.id,
      user.role,
      {},
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
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
  @UseGuards(JwtAuthGuard)
  markCompleted(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('outcome') outcome: string,
  ) {
    return this.schedulingService.markCompleted(id, user.organizationId, outcome);
  }

  @Post('appointments/:id/no-show')
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
  createPublicAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.schedulingService.createPublicAppointment(createAppointmentDto);
  }
}


