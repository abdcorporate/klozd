import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateOrganizationSettingsDto, UpdateOrganizationDto } from './dto/settings.dto';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permission } from '../auth/permissions/permissions';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly pricingService: PricingService,
  ) {}

  @Get()
  @RequirePermissions(Permission.SETTINGS_READ)
  getSettings(@CurrentUser() user: any) {
    return this.settingsService.getSettings(user.organizationId);
  }

  @Patch()
  @RequirePermissions(Permission.SETTINGS_WRITE)
  updateSettings(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateOrganizationSettingsDto,
  ) {
    return this.settingsService.updateSettings(user.organizationId, updateDto);
  }

  @Patch('organization')
  @RequirePermissions(Permission.SETTINGS_WRITE)
  updateOrganization(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateOrganizationDto,
  ) {
    return this.settingsService.updateOrganization(user.organizationId, updateDto);
  }

  @Get('pricing/plans')
  @RequirePermissions(Permission.SETTINGS_READ)
  getPricingPlans() {
    return this.pricingService.getAllPlans();
  }
}

