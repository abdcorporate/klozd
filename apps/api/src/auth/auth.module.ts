import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BruteForceService } from './services/brute-force.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { CsrfService } from './services/csrf.service';
import { OwnershipPolicyService } from './policies/ownership-policy.service';
import { OwnershipGuard } from './guards/ownership.guard';
import { CsrfGuard } from './guards/csrf.guard';

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    NotificationsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Access token: 15 minutes (court)
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '15m';
        return {
          secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, BruteForceService, RefreshTokenService, CsrfService, OwnershipPolicyService, OwnershipGuard, CsrfGuard],
  exports: [AuthService, RefreshTokenService, CsrfService, OwnershipPolicyService, OwnershipGuard, CsrfGuard],
})
export class AuthModule {}

