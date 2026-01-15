import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { BruteForceService } from './services/brute-force.service';
import { RefreshTokenService } from './services/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
    private bruteForceService: BruteForceService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async register(registerDto: RegisterDto & { confirmPassword?: string }) {
    const { email, password, firstName, lastName, organizationName, confirmPassword } = registerDto;

    // Vérifier que les mots de passe correspondent
    if (confirmPassword && password !== confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // Vérifier si un utilisateur existe déjà avec cet email
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        firstName: true,
        organizationId: true,
      },
    });

    if (existingUser) {
      // Si l'utilisateur a déjà une organisation, bloquer la création d'une nouvelle org
      if (existingUser.organizationId) {
        throw new BadRequestException(
          'Cet email est déjà associé à une organisation existante. Vous ne pouvez pas créer une nouvelle organisation avec cet email.'
        );
      }

      // Si l'email existe mais sans organisation (vérifié ou non), supprimer l'ancien utilisateur
      // pour permettre la création d'une nouvelle organisation
      await this.prisma.user.delete({
        where: { id: existingUser.id },
      });
      // Continuer avec la création normale du compte
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Générer un code de vérification à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiresAt = new Date();
    verificationCodeExpiresAt.setMinutes(verificationCodeExpiresAt.getMinutes() + 15); // Expire dans 15 minutes

    // Générer un slug unique
    let baseSlug = organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let slug = baseSlug;
    let counter = 1;
    
    // Vérifier si le slug existe déjà et générer un slug unique
    while (await this.prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Créer l'organisation et l'utilisateur
    const organization = await this.prisma.organization.create({
      data: {
        name: organizationName,
        slug: slug,
        users: {
          create: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'ADMIN',
            status: 'ACTIVE',
            emailVerified: false, // Vérification OTP obligatoire - l'utilisateur doit vérifier son email
            verificationCode,
            verificationCodeExpiresAt,
          },
        },
        settings: {
          create: {
            subscriptionPlan: 'solo',
            monthlyPrice: 97,
          },
        },
      },
      include: {
        users: true,
        settings: true,
      },
    });

    const user = organization.users[0];

    // Marquer toutes les invitations existantes pour cet email comme CONFLICT
    // (l'utilisateur ne pourra pas rejoindre une autre org puisqu'il vient de créer la sienne)
    await this.prisma.invitation.updateMany({
      where: {
        email: user.email,
        status: 'INVITED',
      },
      data: {
        status: 'CONFLICT',
      },
    });

    // Envoyer l'email de vérification
    console.log(`📧 Préparation de l'envoi de l'email de vérification à ${user.email} avec le code ${verificationCode}`);
    try {
      const emailSent = await this.notificationsService.sendVerificationEmail(
        user.email,
        verificationCode,
        user.firstName,
      );
      if (emailSent) {
        console.log(`✅ Email de vérification envoyé avec succès à ${user.email}`);
      } else {
        console.error(`❌ ÉCHEC de l'envoi de l'email de vérification à ${user.email} - Vérifiez les logs pour plus de détails`);
      }
    } catch (error) {
      // Log l'erreur mais ne bloque pas l'inscription
      console.error('❌ Erreur lors de l\'envoi de l\'email de vérification:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
    }

    // Ne pas générer de token JWT si l'email n'est pas vérifié
    // L'utilisateur doit d'abord vérifier son email avant de pouvoir se connecter
    return {
      requiresVerification: true,
      email: user.email,
      message: 'Un email de vérification a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception et entrer le code à 6 chiffres pour activer votre compte.',
    };
  }

  async login(loginDto: LoginDto, ip?: string, userAgent?: string) {
    const { email, password } = loginDto;

    // Check brute-force protection BEFORE checking user existence
    // This prevents email enumeration attacks
    await this.bruteForceService.checkLocked(email, ip);

    // Trouver l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
      },
    });

    // Always use the same error message to prevent email enumeration
    const invalidCredentialsError = new UnauthorizedException('Email ou mot de passe incorrect');

    if (!user) {
      // Record failure even if user doesn't exist (to prevent enumeration)
      await this.bruteForceService.recordFailure(email, ip);
      throw invalidCredentialsError;
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Record failure
      await this.bruteForceService.recordFailure(email, ip);
      throw invalidCredentialsError;
    }

    // Vérifier le statut
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Votre compte est désactivé');
    }

    // Vérifier si l'email est vérifié
    if (!user.emailVerified) {
      // Don't record failure for unverified email (different error)
      throw new UnauthorizedException(
        'Votre email n\'a pas été vérifié. Veuillez vérifier votre boîte de réception et cliquer sur le lien de vérification. Si vous n\'avez pas reçu l\'email, vous pouvez en demander un nouveau.',
      );
    }

    // Reset failures on successful login
    await this.bruteForceService.resetFailures(email, ip);

    // Générer le access token (15 min)
    const payload = { sub: user.id, email: user.email, role: user.role, organizationId: user.organizationId };
    const accessToken = this.jwtService.sign(payload);

    // Générer le refresh token (7-30 jours)
    const refreshToken = this.refreshTokenService.generateRefreshToken();
    const refreshTokenRecord = await this.refreshTokenService.createRefreshToken(
      user.id,
      refreshToken,
      userAgent,
      ip,
    );

    return {
      accessToken,
      refreshToken, // Le controller devra le mettre en cookie
      refreshTokenExpiresAt: refreshTokenRecord.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization?.name || null,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string, userAgent?: string, ip?: string): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {
    // Trouver le refresh token valide
    // Note: On doit chercher dans tous les tokens car on ne peut pas hasher avant de comparer
    const allTokens = await this.prisma.refreshToken.findMany({
      where: {
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    let validToken: (typeof allTokens[0]) | null = null;
    for (const dbToken of allTokens) {
      const isValid = await this.refreshTokenService.verifyRefreshToken(refreshToken, dbToken.tokenHash);
      if (isValid) {
        validToken = dbToken;
        break;
      }
    }

    if (!validToken || !validToken.user) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    // Vérifier que l'utilisateur est actif
    if (validToken.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Votre compte est désactivé');
    }

    // Générer nouveau access token
    const payload = {
      sub: validToken.user.id,
      email: validToken.user.email,
      role: validToken.user.role,
      organizationId: validToken.user.organizationId,
    };
    const accessToken = this.jwtService.sign(payload);

    // Rotation du refresh token (invalide l'ancien, crée un nouveau)
    const rotated = await this.refreshTokenService.rotateRefreshToken(
      validToken.id,
      validToken.userId,
      userAgent,
      ip,
    );

    return {
      accessToken,
      refreshToken: rotated.token,
      refreshTokenExpiresAt: rotated.expiresAt,
    };
  }

  /**
   * Logout: révoque le refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    // Trouver le refresh token
    const allTokens = await this.prisma.refreshToken.findMany({
      where: {
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    for (const dbToken of allTokens) {
      const isValid = await this.refreshTokenService.verifyRefreshToken(refreshToken, dbToken.tokenHash);
      if (isValid) {
        await this.refreshTokenService.revokeRefreshToken(dbToken.id);
        return;
      }
    }

    // Si le token n'est pas trouvé, on ne fait rien (idempotent)
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return null;
    }

    // S'assurer que organizationId est toujours présent
    if (!user.organizationId) {
      console.error(`[AuthService] validateUser - User ${userId} n'a pas d'organizationId`);
      return null;
    }

    return user;
  }

  /**
   * Vérifie l'email d'un utilisateur avec un code
   */
  async verifyEmailCode(email: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Aucun utilisateur trouvé avec cet email');
    }

    // Si l'email est déjà vérifié, retourner un succès (pas besoin de revérifier)
    if (user.emailVerified) {
      return {
        message: 'Cet email est déjà vérifié',
        emailVerified: true,
      };
    }

    // Vérifier si le code correspond
    if (user.verificationCode !== code) {
      throw new BadRequestException('Code de vérification invalide');
    }

    // Vérifier si le code a expiré
    if (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date()) {
      throw new BadRequestException('Le code de vérification a expiré. Veuillez demander un nouveau code.');
    }

    // Marquer l'email comme vérifié et supprimer le code
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    return {
      message: 'Votre email a été vérifié avec succès',
      emailVerified: true,
    };
  }

  /**
   * Vérifie l'email d'un utilisateur avec un token (ancienne méthode, gardée pour compatibilité)
   * @deprecated Utilisez verifyEmailCode à la place
   */
  async verifyEmail(token: string) {
    // Cette méthode est conservée pour compatibilité mais ne fonctionnera plus
    throw new BadRequestException('Cette méthode est obsolète. Veuillez utiliser la vérification par code.');
  }

  /**
   * Renvoie un email de vérification avec un nouveau code
   */
  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Aucun utilisateur trouvé avec cet email');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Cet email est déjà vérifié');
    }

    // Générer un nouveau code à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiresAt = new Date();
    verificationCodeExpiresAt.setMinutes(verificationCodeExpiresAt.getMinutes() + 15);

    // Mettre à jour le code
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationCodeExpiresAt,
      },
    });

    // Envoyer l'email
    try {
      await this.notificationsService.sendVerificationEmail(
        user.email,
        verificationCode,
        user.firstName,
      );
      return {
        message: 'Un nouvel email de vérification a été envoyé',
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
      throw new BadRequestException('Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.');
    }
  }

  /**
   * Envoie un email de test de vérification (pour les tests)
   */
  async sendTestVerificationEmail(email: string) {
    // Générer un code de test à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      const result = await this.notificationsService.sendVerificationEmail(
        email,
        verificationCode,
        'Test',
      );
      
      if (result) {
        return {
          message: `Email de test envoyé avec succès à ${email}`,
          verificationCode, // Pour les tests, on retourne le code
          success: true,
        };
      } else {
        throw new BadRequestException('Échec de l\'envoi de l\'email. Vérifiez la configuration Resend.');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'email de test:', error);
      throw new BadRequestException(`Erreur lors de l'envoi de l'email: ${error.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Récupère le code de vérification pour le développement
   * ⚠️ À désactiver en production
   */
  async getVerificationCodeForDev(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        emailVerified: true,
        verificationCode: true,
        verificationCodeExpiresAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.emailVerified) {
      return {
        message: 'Cet email est déjà vérifié',
        emailVerified: true,
      };
    }

    if (!user.verificationCode) {
      throw new NotFoundException('Aucun code de vérification trouvé');
    }

    const isExpired = user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date();

    return {
      email: user.email,
      verificationCode: user.verificationCode,
      expiresAt: user.verificationCodeExpiresAt,
      isExpired,
      message: isExpired 
        ? '⚠️ Ce code a expiré. Demandez un nouveau code de vérification.'
        : '✅ Code de vérification récupéré (développement uniquement)',
    };
  }
}


