import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { LeadsTasksService } from './leads-tasks.service';
import { ScoringService } from './services/scoring.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FormsModule } from '../forms/forms.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    FormsModule,
    NotificationsModule,
    SettingsModule,
    ScheduleModule.forRoot(),
    forwardRef(() => SchedulingModule),
  ],
  controllers: [LeadsController],
  providers: [LeadsService, LeadsTasksService, ScoringService],
  exports: [LeadsService, ScoringService],
})
export class LeadsModule {}

