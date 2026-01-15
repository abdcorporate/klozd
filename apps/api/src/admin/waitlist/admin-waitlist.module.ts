import { Module } from '@nestjs/common';
import { AdminWaitlistController } from './admin-waitlist.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminWaitlistController],
})
export class AdminWaitlistModule {}
