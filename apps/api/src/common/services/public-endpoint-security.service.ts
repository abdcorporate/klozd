import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { getClientIp } from '../utils/ip-utils';

export interface SecurityValidationResult {
  blocked: boolean;
  reason?: string;
}

@Injectable()
export class PublicEndpointSecurityService {
  private readonly logger = new Logger(PublicEndpointSecurityService.name);
  private readonly MIN_FORM_FILL_TIME_MS = 2000; // 2 secondes minimum
  private readonly trustProxy: boolean;

  constructor(private configService: ConfigService) {
    this.trustProxy = this.configService.get<string>('TRUST_PROXY') === 'true';
  }

  /**
   * Valide le honeypot field (doit être vide)
   */
  validateHoneypot(honeypot?: string): SecurityValidationResult {
    if (honeypot && honeypot.trim() !== '') {
      return {
        blocked: true,
        reason: 'Honeypot field is not empty (bot detected)',
      };
    }
    return { blocked: false };
  }

  /**
   * Valide le timestamp token (formRenderedAt)
   * Si le formulaire est soumis trop rapidement (< 2s), c'est suspect
   */
  validateTimestampToken(formRenderedAt?: string | number): SecurityValidationResult {
    if (formRenderedAt == null || formRenderedAt === '') {
      this.logger.warn('No formRenderedAt timestamp provided');
      return { blocked: false };
    }

    try {
      // Accepter number (epoch ms) ou string numérique
      const ms =
        typeof formRenderedAt === 'number'
          ? formRenderedAt
          : /^\d+$/.test(String(formRenderedAt).trim())
            ? parseInt(String(formRenderedAt), 10)
            : NaN;
      const renderedAt = !Number.isNaN(ms) ? new Date(ms) : new Date(formRenderedAt as string);
      if (Number.isNaN(renderedAt.getTime())) {
        this.logger.warn(`Invalid formRenderedAt timestamp: ${formRenderedAt}`);
        return { blocked: true, reason: 'Invalid formRenderedAt timestamp format' };
      }
      const now = new Date();
      const timeDiff = now.getTime() - renderedAt.getTime();

      if (timeDiff < this.MIN_FORM_FILL_TIME_MS) {
        return {
          blocked: true,
          reason: `Form submitted too quickly (${timeDiff}ms < ${this.MIN_FORM_FILL_TIME_MS}ms)`,
        };
      }

      // Vérifier aussi que le timestamp n'est pas trop ancien (plus de 1h)
      const MAX_FORM_AGE_MS = 60 * 60 * 1000; // 1 heure
      if (timeDiff > MAX_FORM_AGE_MS) {
        return {
          blocked: true,
          reason: `Form timestamp too old (${Math.round(timeDiff / 1000 / 60)}min > 60min)`,
        };
      }

      return { blocked: false };
    } catch (error) {
      this.logger.warn(`Invalid formRenderedAt timestamp: ${formRenderedAt}`);
      return {
        blocked: true,
        reason: 'Invalid formRenderedAt timestamp format',
      };
    }
  }

  /**
   * Valide toutes les mesures de sécurité
   */
  validateSecurity(honeypot?: string, formRenderedAt?: string): void {
    // Valider honeypot
    const honeypotResult = this.validateHoneypot(honeypot);
    if (honeypotResult.blocked) {
      throw new BadRequestException('Invalid form submission');
    }

    // Valider timestamp
    const timestampResult = this.validateTimestampToken(formRenderedAt);
    if (timestampResult.blocked) {
      throw new ThrottlerException('Form submitted too quickly. Please take your time filling the form.');
    }
  }

  /**
   * Extrait les informations de requête pour le logging
   */
  extractRequestInfo(req: Request, formSlug?: string): {
    ip: string;
    userAgent: string;
    formSlug?: string;
  } {
    const ip = getClientIp(req, this.trustProxy);
    const userAgent = req.headers['user-agent'] || 'unknown';

    return {
      ip,
      userAgent,
      formSlug,
    };
  }

  /**
   * Log une tentative bloquée
   */
  logBlockedAttempt(
    reason: string,
    ip: string,
    userAgent: string,
    formSlug?: string,
    additionalInfo?: Record<string, any>,
  ): void {
    this.logger.warn(
      `🚫 Blocked public endpoint request: ${reason}`,
      JSON.stringify({
        reason,
        ip,
        userAgent,
        formSlug,
        ...additionalInfo,
      }),
    );
  }

  /**
   * Log une requête publique réussie
   */
  logPublicRequest(
    endpoint: string,
    ip: string,
    userAgent: string,
    formSlug?: string,
    additionalInfo?: Record<string, any>,
  ): void {
    this.logger.log(
      `✅ Public endpoint request: ${endpoint}`,
      JSON.stringify({
        endpoint,
        ip,
        userAgent,
        formSlug,
        ...additionalInfo,
      }),
    );
  }
}
