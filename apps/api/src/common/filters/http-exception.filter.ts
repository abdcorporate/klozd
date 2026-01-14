import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  Optional,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { SentryService } from '../sentry/sentry.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: PinoLogger,
    @Optional() @Inject(SentryService) private readonly sentryService?: SentryService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request as any).requestId || 'unknown';
    const user = (request as any).user;
    const userId = user?.id || null;
    const organizationId = user?.organizationId || null;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erreur interne du serveur';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error({
        requestId,
        userId,
        organizationId,
        error: exception.message,
        stack: exception.stack,
      }, `Unhandled error: ${exception.message}`);

      // Envoyer à Sentry pour les erreurs serveur
      if (status >= 500 && this.sentryService) {
        this.sentryService.captureException(exception, requestId, {
          user: userId ? { id: userId, organizationId } : undefined,
          request: {
            method: request.method,
            url: request.url,
          },
        });
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      requestId,
      ...(errors && { errors }),
    };

    // Log l'erreur avec requestId
    if (status >= 500) {
      this.logger.error({
        requestId,
        userId,
        organizationId,
        method: request.method,
        url: request.url,
        statusCode: status,
        message,
        stack: exception instanceof Error ? exception.stack : undefined,
      }, `${request.method} ${request.url} - ${status} - ${message}`);
    } else {
      this.logger.warn({
        requestId,
        userId,
        organizationId,
        method: request.method,
        url: request.url,
        statusCode: status,
        message,
      }, `${request.method} ${request.url} - ${status} - ${message}`);
    }

    response.status(status).json(errorResponse);
  }
}




