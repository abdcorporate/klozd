import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';
import { CsrfService } from './services/csrf.service';
import { IpDetectionService } from '../common/services/ip-detection.service';

const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly csrfService: CsrfService,
    private readonly ipDetectionService: IpDetectionService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute (brute-force protection will handle stricter limits)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('🔐 Tentative de connexion pour:', loginDto.email);
    const ip = this.ipDetectionService.getClientIp(req);
    const userAgent = req.headers['user-agent'];
    try {
      const result = await this.authService.login(loginDto, ip, userAgent);

      // Set refresh token in cookie
      const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
      const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
      const cookieOptions: any = {
        httpOnly: true,
        secure: isProduction, // Secure only in production
        sameSite: isProduction ? ('lax' as const) : ('lax' as const),
        maxAge: result.refreshTokenExpiresAt.getTime() - Date.now(), // Milliseconds
        path: '/',
      };
      
      // Set domain only if specified (and in production)
      if (cookieDomain && isProduction) {
        cookieOptions.domain = cookieDomain;
      }

      res.cookie('refreshToken', result.refreshToken, cookieOptions);

      // Return access token in JSON (not refresh token)
      console.log('✅ Connexion réussie pour:', loginDto.email);
      return {
        accessToken: result.accessToken,
        user: result.user,
      };
    } catch (error) {
      console.error('❌ Erreur de connexion:', error.message);
      throw error;
    }
  }

  @Get('csrf')
  @Public() // Endpoint public, accessible sans authentification
  @HttpCode(HttpStatus.OK)
  async getCsrfToken(@Res({ passthrough: true }) res: Response) {
    const token = this.csrfService.generateToken();
    
    // Set CSRF token in cookie (non-HttpOnly, readable by JavaScript)
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
    const cookieOptions: any = {
      httpOnly: false, // Non-HttpOnly so JavaScript can read it
      secure: isProduction, // Secure only in production
      sameSite: isProduction ? ('lax' as const) : ('lax' as const),
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    };
    
    // Set domain only if specified (and in production)
    if (cookieDomain && isProduction) {
      cookieOptions.domain = cookieDomain;
    }

    res.cookie('csrfToken', token, cookieOptions);

    return {
      csrfToken: token,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(CsrfGuard)
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }

    const userAgent = req.headers['user-agent'];
    const ip = this.ipDetectionService.getClientIp(req);

    try {
      const result = await this.authService.refreshAccessToken(refreshToken, userAgent, ip);

      // Set new refresh token in cookie (rotation)
      const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
      const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
      const cookieOptions: any = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? ('lax' as const) : ('lax' as const),
        maxAge: result.refreshTokenExpiresAt.getTime() - Date.now(),
        path: '/',
      };
      
      // Set domain only if specified (and in production)
      if (cookieDomain && isProduction) {
        cookieOptions.domain = cookieDomain;
      }

      res.cookie('refreshToken', result.refreshToken, cookieOptions);

      return {
        accessToken: result.accessToken,
      };
    } catch (error) {
      // Clear cookie on error
      res.clearCookie('refreshToken', { path: '/' });
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, CsrfGuard)
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      try {
        await this.authService.logout(refreshToken);
      } catch (error) {
        // Ignore errors (token might already be invalid)
      }
    }

    // Clear cookie (with same options as set)
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
    const clearCookieOptions: any = { path: '/' };
    if (cookieDomain && isProduction) {
      clearCookieOptions.domain = cookieDomain;
    }
    res.clearCookie('refreshToken', clearCookieOptions);

    return {
      message: 'Déconnexion réussie',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    // Récupérer les infos complètes de l'utilisateur
    const fullUser = await this.authService.validateUser(user.id);
    if (!fullUser) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return {
      user: {
        id: fullUser.id,
        email: fullUser.email,
        firstName: fullUser.firstName,
        lastName: fullUser.lastName,
        role: fullUser.role,
        organizationId: fullUser.organizationId,
        organizationName: fullUser.organization?.name || null,
      },
    };
  }

  @Post('verify-email-code')
  @HttpCode(HttpStatus.OK)
  async verifyEmailCode(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmailCode(body.email, body.code);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  async resendVerificationEmail(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  @Post('test-email')
  @HttpCode(HttpStatus.OK)
  async testEmail(@Body() body: { email: string }) {
    return this.authService.sendTestVerificationEmail(body.email);
  }

  /**
   * Endpoint de développement pour récupérer le code de vérification
   * ⚠️ À désactiver en production
   */
  @Get('dev/verification-code/:email')
  async getVerificationCode(@Param('email') email: string) {
    return this.authService.getVerificationCodeForDev(email);
  }
}


