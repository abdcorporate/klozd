import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { IdempotencyService } from './services/idempotency.service';
import { DistributedLockService } from './services/distributed-lock.service';
import { PublicEndpointSecurityService } from './services/public-endpoint-security.service';
import { IpDetectionService } from './services/ip-detection.service';
import { AuditLogService } from './services/audit-log.service';
import { DataRetentionService } from './services/data-retention.service';
import { DataRetentionTasksService } from './services/data-retention-tasks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), ConfigModule],
  providers: [
    IdempotencyService,
    DistributedLockService,
    PublicEndpointSecurityService,
    IpDetectionService,
    AuditLogService,
    DataRetentionService,
    DataRetentionTasksService,
  ],
  exports: [
    IdempotencyService,
    DistributedLockService,
    PublicEndpointSecurityService,
    IpDetectionService,
    AuditLogService,
    DataRetentionService,
  ],
})
export class CommonModule {}
