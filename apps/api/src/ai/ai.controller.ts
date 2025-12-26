import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-sentiment')
  analyzeSentiment(@CurrentUser() user: any, @Body('text') text: string) {
    return this.aiService.analyzeSentiment(text);
  }

  @Post('leads/:leadId/suggestions')
  generateMessageSuggestions(@CurrentUser() user: any, @Param('leadId') leadId: string) {
    return this.aiService.generateMessageSuggestions(leadId);
  }
}




