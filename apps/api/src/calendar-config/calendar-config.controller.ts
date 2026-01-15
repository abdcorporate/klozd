import { Controller, Get, Patch, Body, UseGuards, BadRequestException, Req } from '@nestjs/common';
import { CalendarConfigService } from './calendar-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateCalendarConfigDto } from './dto/calendar-config.dto';
import { IpDetectionService } from '../common/services/ip-detection.service';

@Controller('calendar-config')
@UseGuards(JwtAuthGuard)
export class CalendarConfigController {
  constructor(
    private readonly calendarConfigService: CalendarConfigService,
    private readonly ipDetectionService: IpDetectionService,
  ) {}

  @Get()
  async findOne(@CurrentUser() user: any) {
    // Seul l'ADMIN peut accéder à la configuration
    if (user.role !== 'ADMIN') {
      throw new BadRequestException('Seul l\'administrateur peut accéder à la configuration du calendrier');
    }
    return this.calendarConfigService.findOne(user.organizationId);
  }

  @Patch()
  async update(@CurrentUser() user: any, @Body() updateDto: UpdateCalendarConfigDto, @Req() req: any) {
    // Seul l'ADMIN peut modifier la configuration
    if (user.role !== 'ADMIN') {
      throw new BadRequestException('Seul l\'administrateur peut modifier la configuration du calendrier');
    }
    const reqMeta = {
      ip: this.ipDetectionService.getClientIp(req),
      userAgent: req.headers['user-agent'],
    };
    return this.calendarConfigService.update(user.organizationId, updateDto, user.id, reqMeta);
  }
}

