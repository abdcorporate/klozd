import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';
import { SchedulingTasksService } from './scheduling-tasks.service';
import { FollowUpTasksService } from './follow-up-tasks.service';
import { AttributionService } from './services/attribution.service';
import { VisioService } from './services/visio.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CalendarConfigModule } from '../calendar-config/calendar-config.module';

@Module({
  imports: [
    PrismaModule,
    AiModule,
    NotificationsModule,
    CalendarConfigModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [SchedulingController],
  providers: [
    SchedulingService,
    SchedulingTasksService,
    FollowUpTasksService,
    AttributionService,
    VisioService,
  ],
  exports: [SchedulingService, AttributionService],
})
export class SchedulingModule {}


