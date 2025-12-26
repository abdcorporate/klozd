import { Module } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CallsController, CallsWebhookController } from './calls.controller';
import { LivekitService } from './services/livekit.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CallsController, CallsWebhookController],
  providers: [CallsService, LivekitService],
  exports: [CallsService, LivekitService],
})
export class CallsModule {}




