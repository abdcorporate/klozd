import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OpenAIService } from './services/openai.service';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService, OpenAIService],
  exports: [AiService, OpenAIService],
})
export class AiModule {}


