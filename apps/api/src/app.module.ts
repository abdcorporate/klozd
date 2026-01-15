import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FormsModule } from './forms/forms.module';
import { LeadsModule } from './leads/leads.module';
import { CrmModule } from './crm/crm.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { AiModule } from './ai/ai.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
import { ExportsModule } from './exports/exports.module';
import { SettingsModule } from './settings/settings.module';
import { CallsModule } from './calls/calls.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { InvitationsModule } from './invitations/invitations.module';
import { SitesModule } from './sites/sites.module';
import { CalendarConfigModule } from './calendar-config/calendar-config.module';
import { QueueModule } from './queue/queue.module';
import { AdminJobsModule } from './admin/jobs/admin-jobs.module';
import { AdminAuditLogsModule } from './admin/audit-logs/admin-audit-logs.module';
import { AdminWaitlistModule } from './admin/waitlist/admin-waitlist.module';
import { HealthModule } from './health/health.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { SentryModule } from './common/sentry/sentry.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { ThrottlerAuthGuard } from './common/guards/throttler-auth.guard';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        const logLevel = configService.get<string>('LOG_LEVEL') || 'info';
        const logPretty = configService.get<string>('LOG_PRETTY') === 'true' || !isProduction;

        return {
          pinoHttp: {
            level: logLevel,
            transport: logPretty
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: false,
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname',
                  },
                }
              : undefined,
            serializers: {
              req: (req: any) => ({
                id: req.id || req.requestId,
                method: req.method,
                url: req.url,
              }),
              res: (res: any) => ({
                statusCode: res.statusCode,
              }),
            },
            customProps: (req: any) => ({
              requestId: req.requestId || req.id,
            }),
          },
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // Conservative: 100 requests per minute globally
      },
    ]),
    PrismaModule,
    AuthModule,
    FormsModule,
    LeadsModule,
    CrmModule,
    DashboardModule,
    SchedulingModule,
    AiModule,
    NotificationsModule,
    UsersModule,
    ExportsModule,
    SettingsModule,
    CallsModule,
    OrganizationsModule,
    InvitationsModule,
    SitesModule,
    CalendarConfigModule,
    QueueModule,
    AdminJobsModule,
    AdminAuditLogsModule,
    AdminWaitlistModule,
    HealthModule,
    WaitlistModule,
    SentryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerAuthGuard, // Utilise le guard personnalisé qui ignore le throttling pour les utilisateurs authentifiés
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
