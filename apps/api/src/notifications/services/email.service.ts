import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import axios from 'axios';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resendClient: Resend | null = null;
  private emailProvider: 'RESEND' | 'SENDGRID' | null = null;

  constructor(private configService: ConfigService) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');

    if (resendApiKey) {
      this.resendClient = new Resend(resendApiKey);
      this.emailProvider = 'RESEND';
      this.logger.log(`✅ Resend configuré pour l'envoi d'emails (clé: ${resendApiKey.substring(0, 10)}...)`);
    } else if (sendgridApiKey) {
      this.emailProvider = 'SENDGRID';
      this.logger.log('✅ SendGrid configuré pour l\'envoi d\'emails');
    } else {
      this.logger.warn('⚠️ Aucun service d\'email configuré (RESEND_API_KEY ou SENDGRID_API_KEY)');
    }
  }

  /**
   * Envoie un email via Resend ou SendGrid
   */
  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    const from = this.configService.get<string>('EMAIL_FROM') || 'noreply@klozd.com';

    if (!this.emailProvider) {
      this.logger.warn('Aucun service d\'email configuré, email non envoyé');
      this.logger.debug(`Email simulé: ${to} - ${subject}`);
      return false;
    }

    try {
      if (this.emailProvider === 'RESEND' && this.resendClient) {
        this.logger.log(`📧 Tentative d'envoi d'email via Resend de ${from} à ${to} - Sujet: ${subject}`);
        
        const result = await this.resendClient.emails.send({
          from,
          to,
          subject,
          html,
          text,
        });

        if (result.error) {
          this.logger.error('❌ Erreur Resend:', JSON.stringify(result.error, null, 2));
          this.logger.error(`❌ Détails de l'erreur: ${result.error.message || 'Erreur inconnue'}`);
          this.logger.error(`❌ Code d'erreur: ${result.error.name || 'N/A'}`);
          this.logger.error(`❌ Email FROM utilisé: ${from}`);
          this.logger.error(`❌ Email TO: ${to}`);
          // Erreur courante : domaine non vérifié
          if (result.error.message?.includes('domain') || result.error.message?.includes('verified')) {
            this.logger.error('💡 Le domaine utilisé dans EMAIL_FROM doit être vérifié dans Resend Dashboard');
            this.logger.error('💡 Vérifiez sur https://resend.com/domains que le domaine est bien vérifié');
          }
          return false;
        }

        this.logger.log(`✅ Email envoyé via Resend à ${to}: ${subject} (ID: ${result.data?.id || 'N/A'})`);
        return true;
      } else if (this.emailProvider === 'SENDGRID') {
        const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
        const response = await axios.post(
          'https://api.sendgrid.com/v3/mail/send',
          {
            personalizations: [
              {
                to: [{ email: to }],
                subject,
              },
            ],
            from: { email: from },
            content: [
              {
                type: 'text/html',
                value: html,
              },
              ...(text
                ? [
                    {
                      type: 'text/plain',
                      value: text,
                    },
                  ]
                : []),
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${sendgridApiKey}`,
              'Content-Type': 'application/json',
            },
          },
        );

        this.logger.log(`Email envoyé via SendGrid à ${to}: ${subject}`);
        return response.status === 202;
      }
    } catch (error: any) {
      this.logger.error(`❌ Erreur lors de l'envoi d'email à ${to}:`, error.response?.data || error.message);
      this.logger.error(`❌ Stack trace:`, error.stack);
      this.logger.error(`❌ Erreur complète:`, JSON.stringify(error, null, 2));
      return false;
    }

    return false;
  }

  /**
   * Envoie un email de confirmation de RDV
   */
  async sendAppointmentConfirmation(
    to: string,
    appointmentDate: Date,
    closerName: string,
    visioUrl?: string,
  ): Promise<boolean> {
    const subject = 'Confirmation de votre rendez-vous';
    const html = `
      <h2>Votre rendez-vous est confirmé</h2>
      <p>Bonjour,</p>
      <p>Votre rendez-vous avec ${closerName} est confirmé pour le ${appointmentDate.toLocaleDateString('fr-FR')} à ${appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.</p>
      ${visioUrl ? `<p><a href="${visioUrl}">Rejoindre la visioconférence</a></p>` : ''}
      <p>À bientôt,<br>L'équipe KLOZD</p>
    `;

    return this.sendEmail(to, subject, html);
  }

  /**
   * Envoie un rappel de RDV
   */
  async sendAppointmentReminder(
    to: string,
    appointmentDate: Date,
    closerName: string,
    visioUrl?: string,
  ): Promise<boolean> {
    const subject = 'Rappel : Votre rendez-vous approche';
    const html = `
      <h2>Rappel de rendez-vous</h2>
      <p>Bonjour,</p>
      <p>Ceci est un rappel : vous avez un rendez-vous avec ${closerName} le ${appointmentDate.toLocaleDateString('fr-FR')} à ${appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.</p>
      ${visioUrl ? `<p><a href="${visioUrl}">Rejoindre la visioconférence</a></p>` : ''}
      <p>À bientôt,<br>L'équipe KLOZD</p>
    `;

    return this.sendEmail(to, subject, html);
  }

  /**
   * Envoie un email de récupération d'abandon
   */
  async sendAbandonRecovery(
    to: string,
    formName: string,
    formUrl: string,
    attempt: number,
  ): Promise<boolean> {
    const subjects = [
      'Vous n\'avez pas terminé votre demande',
      'Dernière chance : Finalisez votre demande',
      'Offre spéciale pour finaliser aujourd\'hui',
    ];

    const subject = subjects[attempt - 1] || subjects[0];
    const html = `
      <h2>Finalisez votre demande</h2>
      <p>Bonjour,</p>
      <p>Vous avez commencé à remplir le formulaire "${formName}" mais ne l'avez pas terminé.</p>
      <p><a href="${formUrl}">Cliquez ici pour finaliser votre demande en 2 minutes</a></p>
      ${attempt === 3 ? '<p><strong>Offre spéciale : -20% si réservation avant vendredi</strong></p>' : ''}
      <p>À bientôt,<br>L'équipe KLOZD</p>
    `;

    return this.sendEmail(to, subject, html);
  }

  /**
   * Envoie un email de vérification d'adresse email avec un code à 6 chiffres
   */
  async sendVerificationEmail(to: string, verificationCode: string, firstName: string): Promise<boolean> {
    this.logger.log(`📧 Tentative d'envoi d'email de vérification à ${to} avec le code ${verificationCode}`);
    
    const subject = 'Vérifiez votre adresse email - KLOZD';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #fe9b27;">Bienvenue sur KLOZD, ${firstName} !</h2>
        <p>Merci de vous être inscrit sur KLOZD. Pour activer votre compte, veuillez vérifier votre adresse email en utilisant le code de vérification ci-dessous :</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f5f5f5; border: 2px solid #fe9b27; border-radius: 8px; padding: 20px; display: inline-block;">
            <p style="margin: 0; font-size: 14px; color: #666; margin-bottom: 10px;">Votre code de vérification :</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; color: #fe9b27; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${verificationCode}
            </p>
          </div>
        </div>
        <p style="color: #666; font-size: 14px; text-align: center;">
          Entrez ce code sur la page de vérification pour activer votre compte.
        </p>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          Ce code expirera dans 15 minutes. Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
        </p>
        <p style="margin-top: 20px;">
          À bientôt,<br>
          L'équipe KLOZD
        </p>
      </div>
    `;

    const text = `
Bienvenue sur KLOZD, ${firstName} !

Merci de vous être inscrit sur KLOZD. Pour activer votre compte, veuillez vérifier votre adresse email en utilisant le code de vérification suivant :

${verificationCode}

Entrez ce code sur la page de vérification pour activer votre compte.

Ce code expirera dans 15 minutes. Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.

À bientôt,
L'équipe KLOZD
    `;

    const result = await this.sendEmail(to, subject, html, text);
    
    if (result) {
      this.logger.log(`✅ Email de vérification envoyé avec succès à ${to}`);
    } else {
      this.logger.error(`❌ Échec de l'envoi de l'email de vérification à ${to}`);
    }
    
    return result;
  }

  /**
   * Envoie un email d'invitation à rejoindre une organisation
   */
  async sendInvitationEmail(
    to: string,
    inviteUrl: string,
    organizationName: string,
    firstName: string,
    lastName: string,
  ): Promise<boolean> {
    const subject = `Invitation à rejoindre ${organizationName} sur KLOZD`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #FF6B35; margin-bottom: 20px;">Invitation KLOZD</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Bonjour ${firstName} ${lastName},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Vous avez été invité(e) à rejoindre l'organisation <strong>${organizationName}</strong> sur KLOZD.
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Cliquez sur le bouton ci-dessous pour accepter l'invitation et créer votre compte :
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${inviteUrl}" style="display: inline-block; background-color: #FF6B35; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Accepter l'invitation
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Ou copiez-collez ce lien dans votre navigateur :<br>
            <a href="${inviteUrl}" style="color: #FF6B35; word-break: break-all;">${inviteUrl}</a>
          </p>
          
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Cette invitation expirera dans 7 jours. Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.
          </p>
          
          <p style="margin-top: 20px;">
            À bientôt,<br>
            L'équipe KLOZD
          </p>
        </div>
      </div>
    `;

    const text = `
Invitation KLOZD

Bonjour ${firstName} ${lastName},

Vous avez été invité(e) à rejoindre l'organisation ${organizationName} sur KLOZD.

Cliquez sur le lien suivant pour accepter l'invitation et créer votre compte :

${inviteUrl}

Cette invitation expirera dans 7 jours. Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.

À bientôt,
L'équipe KLOZD
    `;

    const result = await this.sendEmail(to, subject, html, text);
    
    if (result) {
      this.logger.log(`✅ Email d'invitation envoyé avec succès à ${to}`);
    } else {
      this.logger.error(`❌ Échec de l'envoi de l'email d'invitation à ${to}`);
    }
    
    return result;
  }
}


