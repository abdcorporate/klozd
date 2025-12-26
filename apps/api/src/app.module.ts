import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ThrottlerAuthGuard } from './common/guards/throttler-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 300, // 300 requêtes par minute (augmenté pour éviter les erreurs 429)
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
  ],
})
export class AppModule {}
