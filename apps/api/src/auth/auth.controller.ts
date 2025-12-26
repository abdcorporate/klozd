import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    console.log('🔐 Tentative de connexion pour:', loginDto.email);
    try {
      const result = await this.authService.login(loginDto);
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


