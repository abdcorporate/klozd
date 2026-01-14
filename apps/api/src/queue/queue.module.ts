import { Module, Global } from '@nestjs/common';
import { QueueService } from './queue.service';
import { FailedJobService } from './failed-job.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [QueueService, FailedJobService],
  exports: [QueueService, FailedJobService],
})
export class QueueModule {}
