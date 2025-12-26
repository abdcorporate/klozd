import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export type VisioProvider = 'ZOOM' | 'GOOGLE_MEET' | 'CUSTOM';

interface VisioMeeting {
  meetingUrl: string;
  meetingId: string;
  password?: string;
  startUrl?: string;
}

@Injectable()
export class VisioService {
  private readonly logger = new Logger(VisioService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Crée une réunion Zoom
   */
  async createZoomMeeting(
    topic: string,
    startTime: Date,
    duration: number,
    timezone: string = 'Europe/Paris',
  ): Promise<VisioMeeting> {
    const apiKey = this.configService.get<string>('ZOOM_API_KEY');
    const apiSecret = this.configService.get<string>('ZOOM_API_SECRET');
    const accountId = this.configService.get<string>('ZOOM_ACCOUNT_ID');

    if (!apiKey || !apiSecret) {
      this.logger.warn('ZOOM_API_KEY ou ZOOM_API_SECRET non configuré');
      throw new Error('Configuration Zoom manquante');
    }

    try {
      // Obtenir un access token OAuth
      const token = await this.getZoomAccessToken(apiKey, apiSecret, accountId);

      // Créer la réunion
      const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          topic,
          type: 2, // Scheduled meeting
          start_time: startTime.toISOString(),
          duration,
          timezone,
          settings: {
            join_before_host: true,
            waiting_room: false,
            meeting_authentication: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        meetingUrl: response.data.join_url,
        meetingId: response.data.id.toString(),
        password: response.data.password,
        startUrl: response.data.start_url,
      };
    } catch (error: any) {
      this.logger.error('Erreur lors de la création de la réunion Zoom:', error.response?.data || error.message);
      throw new Error('Impossible de créer la réunion Zoom');
    }
  }

  /**
   * Obtient un access token Zoom via OAuth
   */
  private async getZoomAccessToken(
    apiKey: string,
    apiSecret: string,
    accountId?: string,
  ): Promise<string> {
    try {
      // Si accountId est fourni, utiliser Server-to-Server OAuth
      if (accountId) {
        const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
        const response = await axios.post(
          `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
          {},
          {
            headers: {
              Authorization: `Basic ${credentials}`,
            },
          },
        );
        return response.data.access_token;
      } else {
        // Sinon, utiliser OAuth avec authorization code (nécessite un refresh token)
        // Pour simplifier, on utilise l'API key directe (méthode legacy)
        // Note: Cette méthode est dépréciée mais fonctionne encore
        const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
        const response = await axios.post(
          'https://zoom.us/oauth/token?grant_type=client_credentials',
          {},
          {
            headers: {
              Authorization: `Basic ${credentials}`,
            },
          },
        );
        return response.data.access_token;
      }
    } catch (error: any) {
      this.logger.error('Erreur lors de l\'obtention du token Zoom:', error.response?.data || error.message);
      throw new Error('Impossible d\'obtenir le token Zoom');
    }
  }

  /**
   * Crée une réunion Google Meet
   * Note: Google Meet nécessite Google Calendar API
   */
  async createGoogleMeetMeeting(
    summary: string,
    startTime: Date,
    duration: number,
    attendeeEmail?: string,
  ): Promise<VisioMeeting> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const refreshToken = this.configService.get<string>('GOOGLE_REFRESH_TOKEN');

    if (!clientId || !clientSecret || !refreshToken) {
      this.logger.warn('Configuration Google manquante');
      throw new Error('Configuration Google Meet manquante');
    }

    try {
      // Obtenir un access token
      const accessToken = await this.getGoogleAccessToken(clientId, clientSecret, refreshToken);

      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      // Créer un événement dans Google Calendar avec Google Meet
      const response = await axios.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          summary,
          start: {
            dateTime: startTime.toISOString(),
            timeZone: 'Europe/Paris',
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'Europe/Paris',
          },
          conferenceData: {
            createRequest: {
              requestId: `klozd-${Date.now()}`,
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
            },
          },
          attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        meetingUrl: response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri || '',
        meetingId: response.data.id,
      };
    } catch (error: any) {
      this.logger.error('Erreur lors de la création de la réunion Google Meet:', error.response?.data || error.message);
      throw new Error('Impossible de créer la réunion Google Meet');
    }
  }

  /**
   * Obtient un access token Google via OAuth
   */
  private async getGoogleAccessToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string,
  ): Promise<string> {
    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return response.data.access_token;
    } catch (error: any) {
      this.logger.error('Erreur lors de l\'obtention du token Google:', error.response?.data || error.message);
      throw new Error('Impossible d\'obtenir le token Google');
    }
  }

  /**
   * Crée une réunion selon le provider configuré
   */
  async createMeeting(
    provider: VisioProvider,
    topic: string,
    startTime: Date,
    duration: number,
    attendeeEmail?: string,
  ): Promise<VisioMeeting> {
    switch (provider) {
      case 'ZOOM':
        return this.createZoomMeeting(topic, startTime, duration);
      case 'GOOGLE_MEET':
        return this.createGoogleMeetMeeting(topic, startTime, duration, attendeeEmail);
      case 'CUSTOM':
        // Pour les URLs personnalisées, on ne crée pas de réunion
        throw new Error('Provider CUSTOM ne nécessite pas de création de réunion');
      default:
        throw new Error(`Provider ${provider} non supporté`);
    }
  }
}




