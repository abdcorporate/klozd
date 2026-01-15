import { Injectable, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../notifications/services/email.service';
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
    private emailService: EmailService,
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

    // Envoyer un email de confirmation (optionnel, ne bloque pas l'inscription si échec)
    try {
      await this.sendWelcomeEmail(entry.email, entry.firstName || '');
    } catch (error: any) {
      // Ne pas faire échouer la création si l'email échoue
      this.logger.warn(`Failed to send welcome email to ${entry.email}: ${error?.message || 'Unknown error'}`);
    }

    return {
      id: entry.id,
      email: entry.email,
      alreadyJoined: false,
    };
  }

  /**
   * Envoie un email de confirmation d'inscription à la waitlist
   */
  private async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const subject = '🎉 Bienvenue sur la waitlist KLOZD !';
    const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,';
    
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur la waitlist KLOZD</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f9952a 0%, #ffa500 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">KLOZD</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Le CRM tout-en-un pour closer plus de deals</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">${greeting}</h2>
              
              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Merci pour votre inscription à la waitlist KLOZD ! 🎉
              </p>
              
              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Vous faites maintenant partie des premiers à découvrir notre plateforme CRM révolutionnaire. 
                Nous vous tiendrons informé dès que KLOZD sera disponible.
              </p>
              
              <div style="background-color: #fff7ed; border-left: 4px solid #f9952a; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 600; margin-bottom: 10px;">
                  💎 Avantages réservés aux membres de la waitlist :
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 15px; line-height: 1.8;">
                  <li>Tarif fondateur exclusif</li>
                  <li>Accès prioritaire à la plateforme</li>
                  <li>Canal privé pour vos retours</li>
                </ul>
              </div>
              
              <p style="margin: 30px 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                En attendant, n'hésitez pas à nous suivre pour rester informé de nos actualités.
              </p>
              
              <p style="margin: 0 0 30px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                À très bientôt,<br>
                <strong style="color: #1a1a1a;">L'équipe KLOZD</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px;">
                KLOZD - Le CRM tout-en-un pour infopreneurs et équipes de closing
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                Cet email a été envoyé à ${email} car vous vous êtes inscrit à notre waitlist.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const text = `
${greeting}

Merci pour votre inscription à la waitlist KLOZD ! 🎉

Vous faites maintenant partie des premiers à découvrir notre plateforme CRM révolutionnaire. 
Nous vous tiendrons informé dès que KLOZD sera disponible.

💎 Avantages réservés aux membres de la waitlist :
- Tarif fondateur exclusif
- Accès prioritaire à la plateforme
- Canal privé pour vos retours

En attendant, n'hésitez pas à nous suivre pour rester informé de nos actualités.

À très bientôt,
L'équipe KLOZD

---
KLOZD - Le CRM tout-en-un pour infopreneurs et équipes de closing
Cet email a été envoyé à ${email} car vous vous êtes inscrit à notre waitlist.
    `;

    try {
      const sent = await this.emailService.sendEmail(email, subject, html, text);
      if (sent) {
        this.logger.log(`✅ Email de confirmation envoyé à ${email}`);
      } else {
        this.logger.warn(`⚠️ Email de confirmation non envoyé (service non configuré) pour ${email}`);
      }
    } catch (error: any) {
      this.logger.error(`❌ Erreur lors de l'envoi de l'email de confirmation à ${email}: ${error.message}`);
      throw error; // Re-throw pour que l'appelant puisse gérer
    }
  }
}
