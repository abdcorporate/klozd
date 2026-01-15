import { Module } from '@nestjs/common';
import { AdminAuditLogsController } from './admin-audit-logs.controller';
import { CommonModule } from '../../common/common.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [AdminAuditLogsController],
})
export class AdminAuditLogsModule {}
