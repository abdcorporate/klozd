import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Service de sécurité avancé pour la waitlist
 * Implémente des validations strictes et des détections d'anomalies
 */
@Injectable()
export class WaitlistSecurityService {
  private readonly logger = new Logger(WaitlistSecurityService.name);
  
  // Domaines d'emails jetables connus (liste partielle, peut être étendue)
  private readonly DISPOSABLE_EMAIL_DOMAINS = new Set([
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.com',
    'throwaway.email',
    'yopmail.com',
    'mohmal.com',
    'fakeinbox.com',
    'getnada.com',
    'maildrop.cc',
    'temp-mail.org',
    'sharklasers.com',
    'getairmail.com',
    'mintemail.com',
    'trashmail.com',
    'mailnesia.com',
    'meltmail.com',
    'melt.li',
    'emailondeck.com',
    'spamgourmet.com',
    'spamhole.com',
    'spam.la',
    'spamfree24.org',
    'spamfree24.de',
    'spamfree24.eu',
    'spamfree24.net',
    'spamfree24.com',
    'spamfree24.org',
    'spamfree24.de',
    'spamfree24.eu',
    'spamfree24.net',
    'spamfree24.com',
  ]);

  // Domaines blacklistés (spam, fraud, etc.)
  private readonly BLACKLISTED_DOMAINS = new Set<string>([
    // À compléter selon vos besoins
  ]);

  // Patterns suspects pour détection de bots
  private readonly SUSPICIOUS_PATTERNS = [
    /^test\d+@/i,
    /^user\d+@/i,
    /^admin\d+@/i,
    /^temp\d+@/i,
    /^fake\d+@/i,
    /^spam\d+@/i,
    /^bot\d+@/i,
  ];

  // User-Agents suspects (bots connus)
  private readonly SUSPICIOUS_USER_AGENTS = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http/i,
    /httpie/i,
    /postman/i,
    /insomnia/i,
  ];

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Valide l'email avec des règles strictes
   */
  async validateEmail(email: string): Promise<void> {
    // 1. Validation de format basique (déjà fait par class-validator, mais on double-check)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Format d\'email invalide');
    }

    // 2. Normalisation (lowercase)
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Vérification de longueur
    if (normalizedEmail.length > 254) {
      throw new BadRequestException('Email trop long');
    }

    // 4. Vérification du domaine
    const domain = normalizedEmail.split('@')[1];
    if (!domain || domain.length < 3) {
      throw new BadRequestException('Domaine email invalide');
    }

    // 5. Vérification des domaines jetables
    if (this.DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
      this.logger.warn(`Disposable email detected: ${normalizedEmail}`);
      throw new BadRequestException('Les emails temporaires ne sont pas autorisés');
    }

    // 6. Vérification des domaines blacklistés
    if (this.BLACKLISTED_DOMAINS.has(domain)) {
      this.logger.warn(`Blacklisted domain detected: ${normalizedEmail}`);
      throw new BadRequestException('Ce domaine email n\'est pas autorisé');
    }

    // 7. Détection de patterns suspects
    for (const pattern of this.SUSPICIOUS_PATTERNS) {
      if (pattern.test(normalizedEmail)) {
        this.logger.warn(`Suspicious email pattern detected: ${normalizedEmail}`);
        // On log mais on n'empêche pas (peut être légitime)
      }
    }

    // 8. Vérification de caractères interdits
    const forbiddenChars = /[<>\"'\\]/;
    if (forbiddenChars.test(normalizedEmail)) {
      throw new BadRequestException('Email contient des caractères interdits');
    }
  }

  /**
   * Valide le User-Agent pour détecter les bots
   */
  validateUserAgent(userAgent: string | undefined): void {
    if (!userAgent || userAgent.trim() === '') {
      this.logger.warn('Missing User-Agent header');
      // On accepte mais on log (certains clients légitimes peuvent ne pas envoyer)
      return;
    }

    const ua = userAgent.toLowerCase();

    // Détection de bots connus
    for (const pattern of this.SUSPICIOUS_USER_AGENTS) {
      if (pattern.test(ua)) {
        this.logger.warn(`Suspicious User-Agent detected: ${userAgent}`);
        // On log mais on n'empêche pas (peut être un outil de test légitime)
      }
    }
  }

  /**
   * Détecte les tentatives suspectes (même email avec IPs différentes, etc.)
   */
  async detectSuspiciousActivity(
    email: string,
    ip: string,
    userAgent: string | undefined,
  ): Promise<{ suspicious: boolean; reason?: string }> {
    try {
      // 1. Vérifier si le même email a été utilisé récemment avec une IP différente
      const recentEntries = await (this.prisma as any).waitlistEntry.findMany({
        where: {
          email: email.toLowerCase(),
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Dernières 24h
          },
        },
        select: { ip: true },
      });

      if (recentEntries.length > 0) {
        const uniqueIPs = new Set(recentEntries.map((e: any) => e.ip).filter(Boolean));
        if (uniqueIPs.size > 1 && !uniqueIPs.has(ip)) {
          return {
            suspicious: true,
            reason: `Email déjà utilisé avec ${uniqueIPs.size} IPs différentes dans les 24h`,
          };
        }
      }

      // 2. Vérifier si la même IP a créé trop d'entrées récemment
      const ipEntries = await (this.prisma as any).waitlistEntry.findMany({
        where: {
          ip,
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000), // Dernière heure
          },
        },
      });

      const MAX_ENTRIES_PER_IP_PER_HOUR = 10;
      if (ipEntries.length >= MAX_ENTRIES_PER_IP_PER_HOUR) {
        return {
          suspicious: true,
          reason: `Trop d'inscriptions depuis cette IP (${ipEntries.length} dans la dernière heure)`,
        };
      }

      // 3. Vérifier si des emails similaires ont été créés récemment (pattern de spam)
      const emailPrefix = email.split('@')[0];
      if (emailPrefix.length > 3) {
        const similarEntries = await (this.prisma as any).waitlistEntry.findMany({
          where: {
            email: {
              startsWith: emailPrefix.substring(0, 4),
            },
            createdAt: {
              gte: new Date(Date.now() - 60 * 60 * 1000), // Dernière heure
            },
          },
        });

        const MAX_SIMILAR_EMAILS_PER_HOUR = 5;
        if (similarEntries.length >= MAX_SIMILAR_EMAILS_PER_HOUR) {
          return {
            suspicious: true,
            reason: `Trop d'emails similaires créés récemment (${similarEntries.length})`,
          };
        }
      }

      return { suspicious: false };
    } catch (error: any) {
      this.logger.error(`Error detecting suspicious activity: ${error.message}`);
      // En cas d'erreur, on accepte (fail-open pour éviter de bloquer les utilisateurs légitimes)
      return { suspicious: false };
    }
  }

  /**
   * Sanitize les inputs pour éviter les injections
   */
  sanitizeInput(input: string | undefined | null, maxLength: number = 255): string | undefined {
    if (!input) return undefined;

    // Retirer les caractères de contrôle
    let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');

    // Limiter la longueur
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // Trim
    sanitized = sanitized.trim();

    return sanitized || undefined;
  }

  /**
   * Valide tous les champs du formulaire
   */
  async validateWaitlistEntry(data: {
    email: string;
    firstName?: string;
    role?: string;
    leadVolumeRange?: string;
    teamSize?: string;
    revenue?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    ip: string;
    userAgent?: string;
  }): Promise<void> {
    // 1. Validation de l'email
    await this.validateEmail(data.email);

    // 2. Sanitization des champs optionnels
    const sanitized = {
      firstName: this.sanitizeInput(data.firstName, 100),
      role: this.sanitizeInput(data.role, 50),
      leadVolumeRange: this.sanitizeInput(data.leadVolumeRange, 50),
      teamSize: this.sanitizeInput(data.teamSize, 50),
      revenue: this.sanitizeInput(data.revenue, 50),
      utmSource: this.sanitizeInput(data.utmSource, 100),
      utmMedium: this.sanitizeInput(data.utmMedium, 100),
      utmCampaign: this.sanitizeInput(data.utmCampaign, 100),
    };

    // 3. Validation des valeurs enum pour role (secteur d'activités)
    if (sanitized.role) {
      const validSectors = [
        'it',
        'real-estate',
        'finance',
        'coaching',
        'ecommerce',
        'health',
        'automotive',
        'construction',
        'consulting',
        'other',
      ];
      if (!validSectors.includes(sanitized.role.toLowerCase())) {
        throw new BadRequestException('Secteur d\'activités invalide');
      }
    }

    // 4. Validation des valeurs enum pour leadVolumeRange
    if (sanitized.leadVolumeRange) {
      const validRanges = ['0-50', '50-200', '200-500', '500+'];
      if (!validRanges.includes(sanitized.leadVolumeRange)) {
        throw new BadRequestException('Volume de leads invalide');
      }
    }

    // 5. Validation des valeurs enum pour teamSize
    if (sanitized.teamSize) {
      const validTeamSizes = ['1', '2-5', '6-10', '11-20', '20+'];
      if (!validTeamSizes.includes(sanitized.teamSize)) {
        throw new BadRequestException('Taille d\'équipe invalide');
      }
    }

    // 6. Validation des valeurs enum pour revenue
    if (sanitized.revenue) {
      const validRevenues = ['0-50k', '50k-200k', '200k-500k', '500k-1M', '1M+'];
      if (!validRevenues.includes(sanitized.revenue)) {
        throw new BadRequestException('Chiffre d\'affaires invalide');
      }
    }

    // 7. Validation du User-Agent
    this.validateUserAgent(data.userAgent);

    // 8. Détection d'activité suspecte
    const suspiciousCheck = await this.detectSuspiciousActivity(
      data.email,
      data.ip,
      data.userAgent,
    );

    if (suspiciousCheck.suspicious) {
      this.logger.warn(
        `🚨 Suspicious activity detected: ${suspiciousCheck.reason}`,
        JSON.stringify({
          email: data.email,
          ip: data.ip,
          userAgent: data.userAgent,
          reason: suspiciousCheck.reason,
        }),
      );
      // On log mais on n'empêche pas (peut être un faux positif)
      // En production, vous pourriez vouloir bloquer ou demander une vérification supplémentaire
    }
  }
}
