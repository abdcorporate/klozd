import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { getClientIp } from '../utils/ip-utils';

@Injectable()
export class IpDetectionService {
  private readonly trustProxy: boolean;

  constructor(private configService: ConfigService) {
    this.trustProxy = this.configService.get<string>('TRUST_PROXY') === 'true';
  }

  /**
   * Get client IP from request, handling reverse proxy scenarios
   */
  getClientIp(req: Request): string {
    return getClientIp(req, this.trustProxy);
  }
}
