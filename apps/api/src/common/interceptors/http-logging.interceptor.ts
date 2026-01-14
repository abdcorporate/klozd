import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url } = request;
    const requestId = (request as any).requestId || 'unknown';
    const user = (request as any).user;
    const userId = user?.id || null;
    const organizationId = user?.organizationId || null;

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logger.info({
            requestId,
            method,
            url,
            statusCode,
            durationMs,
            userId,
            organizationId,
          }, `${method} ${url} ${statusCode} - ${durationMs}ms`);
        },
        error: (error) => {
          const durationMs = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.logger.error({
            requestId,
            method,
            url,
            statusCode,
            durationMs,
            userId,
            organizationId,
            error: error.message,
            stack: error.stack,
          }, `${method} ${url} ${statusCode} - ${durationMs}ms - ERROR`);
        },
      }),
    );
  }
}
