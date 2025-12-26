import { Module } from '@nestjs/common';
import { CalendarConfigController } from './calendar-config.controller';
import { CalendarConfigService } from './calendar-config.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CalendarConfigController],
  providers: [CalendarConfigService],
  exports: [CalendarConfigService],
})
export class CalendarConfigModule {}

