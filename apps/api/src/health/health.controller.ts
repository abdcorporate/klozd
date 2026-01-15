import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
@Public() // Health check must be accessible without authentication
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Vérifie l\'état de santé de l\'API, de la base de données et de Redis (si activé)',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check réussi',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['ok', 'degraded'],
          example: 'ok',
        },
        checks: {
          type: 'object',
          properties: {
            db: {
              type: 'object',
              properties: {
                ok: { type: 'boolean', example: true },
                latencyMs: { type: 'number', example: 5 },
              },
            },
            redis: {
              type: 'object',
              properties: {
                ok: { type: 'boolean', example: true },
                latencyMs: { type: 'number', example: 2 },
                enabled: { type: 'boolean', example: true },
              },
            },
          },
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:00:00.000Z',
        },
      },
    },
  })
  async getHealth() {
    return this.healthService.checkHealth();
  }
}
