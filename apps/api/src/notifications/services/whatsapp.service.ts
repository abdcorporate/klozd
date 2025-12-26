import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private twilioClient: twilio.Twilio | null = null;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
      this.logger.log('Twilio configuré pour WhatsApp');
    } else {
      this.logger.warn('TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN non configuré');
    }
  }

  /**
   * Envoie un message WhatsApp via Twilio
   */
  async sendWhatsApp(to: string, message: string): Promise<boolean> {
    const from = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER') || this.configService.get<string>('WHATSAPP_FROM');

    if (!this.twilioClient || !from) {
      this.logger.warn('Twilio WhatsApp non configuré, message non envoyé');
      this.logger.debug(`WhatsApp simulé: ${to} - ${message}`);
      return false;
    }

    try {
      // Formater le numéro de téléphone (ajouter + si nécessaire)
      const formattedTo = to.startsWith('+') ? to : `+${to}`;
      const whatsappFrom = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
      const whatsappTo = `whatsapp:${formattedTo}`;

      const result = await this.twilioClient.messages.create({
        body: message,
        from: whatsappFrom,
        to: whatsappTo,
      });

      this.logger.log(`WhatsApp envoyé via Twilio à ${to} (SID: ${result.sid})`);
      return true;
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'envoi de WhatsApp à ${to}:`, error.message);
      return false;
    }
  }

  /**
   * Envoie une confirmation WhatsApp de RDV
   */
  async sendAppointmentConfirmationWhatsApp(
    to: string,
    appointmentDate: Date,
    closerName: string,
    visioUrl?: string,
  ): Promise<boolean> {
    const message = `✅ RDV confirmé avec ${closerName}\n📅 ${appointmentDate.toLocaleDateString('fr-FR')} à ${appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}\n${visioUrl ? `🔗 ${visioUrl}` : ''}`;
    return this.sendWhatsApp(to, message);
  }
}


