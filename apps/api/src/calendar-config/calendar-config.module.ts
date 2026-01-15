import { Module } from '@nestjs/common';
import { CalendarConfigController } from './calendar-config.controller';
import { CalendarConfigService } from './calendar-config.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [CalendarConfigController],
  providers: [CalendarConfigService],
  exports: [CalendarConfigService],
})
export class CalendarConfigModule {}

