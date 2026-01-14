import { Module } from '@nestjs/common';
import { IdempotencyService } from './services/idempotency.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [IdempotencyService],
  exports: [IdempotencyService],
})
export class CommonModule {}
