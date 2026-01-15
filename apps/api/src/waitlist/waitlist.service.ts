import { Injectable, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WaitlistSecurityService } from './services/waitlist-security.service';

export interface CreateWaitlistEntryDto {
  email: string;
  firstName?: string;
  role?: string;
  leadVolumeRange?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private securityService: WaitlistSecurityService,
  ) {}

  /**
   * Crée une nouvelle entrée dans la waitlist ou retourne l'existante
   */
  async createOrGetEntry(dto: CreateWaitlistEntryDto): Promise<{
    id: string;
    email: string;
    alreadyJoined: boolean;
  }> {
    // 1. Validation de sécurité avancée
    await this.securityService.validateWaitlistEntry({
      email: dto.email,
      firstName: dto.firstName,
      role: dto.role,
      leadVolumeRange: dto.leadVolumeRange,
      utmSource: dto.utmSource,
      utmMedium: dto.utmMedium,
      utmCampaign: dto.utmCampaign,
      ip: dto.ip || 'unknown',
      userAgent: dto.userAgent,
    });

    // 2. Normaliser l'email (lowercase)
    const normalizedEmail = dto.email.toLowerCase().trim();

    // 3. Vérifier si l'email existe déjà
    // Note: Temporary cast until Prisma client is regenerated
    const existing = await (this.prisma as any).waitlistEntry.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      this.logger.log(`Waitlist entry already exists for email: ${normalizedEmail}`);
      return {
        id: existing.id,
        email: existing.email,
        alreadyJoined: true,
      };
    }

    // 4. Sanitizer les données avant insertion
    const sanitizedData = {
      email: normalizedEmail,
      firstName: this.securityService.sanitizeInput(dto.firstName, 100),
      role: this.securityService.sanitizeInput(dto.role, 50)?.toLowerCase(),
      leadVolumeRange: this.securityService.sanitizeInput(dto.leadVolumeRange, 50),
      utmSource: this.securityService.sanitizeInput(dto.utmSource, 100),
      utmMedium: this.securityService.sanitizeInput(dto.utmMedium, 100),
      utmCampaign: this.securityService.sanitizeInput(dto.utmCampaign, 100),
      ip: dto.ip || null,
      userAgent: dto.userAgent || null,
    };

    // 5. Créer une nouvelle entrée
    // Note: Temporary cast until Prisma client is regenerated
    const entry = await (this.prisma as any).waitlistEntry.create({
      data: sanitizedData,
    });

    this.logger.log(`New waitlist entry created: ${entry.email} (${entry.id})`);

    // Envoyer un email de confirmation (optionnel, stub si Resend n'est pas configuré)
    try {
      await this.sendWelcomeEmail(entry.email, entry.firstName || '');
    } catch (error) {
      // Ne pas faire échouer la création si l'email échoue
      this.logger.warn(`Failed to send welcome email to ${entry.email}: ${error.message}`);
    }

    return {
      id: entry.id,
      email: entry.email,
      alreadyJoined: false,
    };
  }

  /**
   * Envoie un email de bienvenue (stub si Resend n'est pas configuré)
   */
  private async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    // TODO: Intégrer avec Resend si disponible
    // Pour l'instant, c'est un stub
    this.logger.log(`Would send welcome email to ${email} (firstName: ${firstName})`);
    
    // Si NotificationsService est configuré avec Resend, on peut l'utiliser :
    // await this.notificationsService.sendEmail({
    //   to: email,
    //   subject: 'Merci pour votre inscription à la waitlist KLOZD',
    //   template: 'waitlist-welcome',
    //   data: { firstName },
    // });
  }
}
