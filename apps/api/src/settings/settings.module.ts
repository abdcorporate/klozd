import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PricingService } from './pricing.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [SettingsController],
  providers: [SettingsService, PricingService],
  exports: [SettingsService, PricingService],
})
export class SettingsModule {}

