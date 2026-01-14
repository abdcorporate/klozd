import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute (brute-force protection will handle stricter limits)
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    console.log('🔐 Tentative de connexion pour:', loginDto.email);
    const ip = req.ip || req.connection?.remoteAddress;
    try {
      const result = await this.authService.login(loginDto, ip);
      console.log('✅ Connexion réussie pour:', loginDto.email);
      return result;
    } catch (error) {
      console.error('❌ Erreur de connexion:', error.message);
      throw error;
    }
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


