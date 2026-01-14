import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger(SentryService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const enabled = this.configService.get<string>('SENTRY_ENABLED') === 'true';
    const dsn = this.configService.get<string>('SENTRY_DSN');

    if (!enabled || !dsn) {
      this.logger.log('Sentry désactivé (SENTRY_ENABLED=false ou SENTRY_DSN manquant)');
      return;
    }

    const environment = this.configService.get<string>('SENTRY_ENVIRONMENT') || 
                       this.configService.get<string>('NODE_ENV') || 
                       'development';
    const tracesSampleRate = parseFloat(
      this.configService.get<string>('SENTRY_TRACES_SAMPLE_RATE') || '0.05'
    );

    try {
      Sentry.init({
        dsn,
        environment,
        tracesSampleRate,
        integrations: [
          nodeProfilingIntegration(),
        ],
        // Scrub sensitive data
        beforeSend(event, hint) {
          // Remove Authorization headers
          if (event.request?.headers) {
            delete event.request.headers['authorization'];
            delete event.request.headers['Authorization'];
          }

          // Remove request body by default (can be enabled per route if needed)
          if (event.request?.data) {
            delete event.request.data;
          }

          return event;
        },
        // Don't send PII
        sendDefaultPii: false,
      });

      this.logger.log(`✅ Sentry initialisé (environment: ${environment}, sample rate: ${tracesSampleRate})`);
    } catch (error) {
      this.logger.error('Erreur lors de l\'initialisation de Sentry:', error);
    }
  }

  /**
   * Capture une exception avec requestId
   */
  captureException(exception: Error, requestId?: string, context?: Record<string, any>) {
    Sentry.withScope((scope) => {
      if (requestId) {
        scope.setTag('requestId', requestId);
      }
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      Sentry.captureException(exception);
    });
  }

  /**
   * Capture un message avec requestId
   */
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', requestId?: string) {
    Sentry.withScope((scope) => {
      if (requestId) {
        scope.setTag('requestId', requestId);
      }
      Sentry.captureMessage(message, level);
    });
  }
}
