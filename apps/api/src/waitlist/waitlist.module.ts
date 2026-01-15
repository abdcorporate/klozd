import { Module } from '@nestjs/common';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';
import { WaitlistSecurityService } from './services/waitlist-security.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, CommonModule, NotificationsModule],
  controllers: [WaitlistController],
  providers: [WaitlistService, WaitlistSecurityService],
  exports: [WaitlistService],
})
export class WaitlistModule {}
