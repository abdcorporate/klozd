import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: twilio.Twilio | null = null;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
      this.logger.log('Twilio configuré pour l\'envoi de SMS');
    } else {
      this.logger.warn('TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN non configuré');
    }
  }

  /**
   * Envoie un SMS via Twilio
   */
  async sendSms(to: string, message: string): Promise<boolean> {
    const from = this.configService.get<string>('TWILIO_PHONE_NUMBER') || this.configService.get<string>('SMS_FROM');

    if (!this.twilioClient || !from) {
      this.logger.warn('Twilio non configuré, SMS non envoyé');
      this.logger.debug(`SMS simulé: ${to} - ${message}`);
      return false;
    }

    try {
      // Formater le numéro de téléphone (ajouter + si nécessaire)
      const formattedTo = to.startsWith('+') ? to : `+${to}`;

      const result = await this.twilioClient.messages.create({
        body: message,
        from,
        to: formattedTo,
      });

      this.logger.log(`SMS envoyé via Twilio à ${to} (SID: ${result.sid})`);
      return true;
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'envoi de SMS à ${to}:`, error.message);
      return false;
    }
  }

  /**
   * Envoie un rappel SMS de RDV
   */
  async sendAppointmentReminderSms(
    to: string,
    appointmentDate: Date,
    visioUrl?: string,
  ): Promise<boolean> {
    const message = `Rappel RDV KLOZD: ${appointmentDate.toLocaleDateString('fr-FR')} à ${appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}. ${visioUrl ? `Lien: ${visioUrl}` : ''}`;
    return this.sendSms(to, message);
  }
}


