import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { WhatsappService } from './services/whatsapp.service';
import { CalendarIcsService } from './services/calendar-ics.service';
import { NotificationsProcessor } from './jobs/notifications.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { FailedJobService } from '../queue/failed-job.service';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailService,
    SmsService,
    WhatsappService,
    CalendarIcsService,
    NotificationsProcessor,
    FailedJobService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}


