import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

@Injectable()
export class LivekitService {
  private readonly logger = new Logger(LivekitService.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly serverUrl: string;
  private readonly roomService: RoomServiceClient;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || '';
    this.serverUrl = this.configService.get<string>('LIVEKIT_API_URL') || '';

    if (!this.apiKey || !this.apiSecret || !this.serverUrl) {
      this.logger.warn(
        'LiveKit non configuré : LIVEKIT_API_KEY, LIVEKIT_API_SECRET ou LIVEKIT_API_URL manquants',
      );
    }

    this.roomService = new RoomServiceClient(this.serverUrl, this.apiKey, this.apiSecret);
  }

  /**
   * Crée un nom de room stable pour un appointment
   */
  createRoomName(organizationId: string, appointmentId: string): string {
    return `org_${organizationId}_apt_${appointmentId}`;
  }

  /**
   * Génère un token d'accès LiveKit pour un utilisateur
   */
  createAccessToken(params: {
    roomName: string;
    identity: string;
    metadata?: string;
    name?: string;
  }): string {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('LiveKit non configuré');
    }

    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: params.identity,
      name: params.name || params.identity,
    });

    at.addGrant({
      room: params.roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    if (params.metadata) {
      at.metadata = params.metadata;
    }

    // toJwt() est synchrone et retourne une string (pas une Promise)
    // On force le type car TypeScript peut parfois inférer incorrectement
    return at.toJwt() as unknown as string;
  }

  /**
   * Crée une room dans LiveKit (optionnel, peut être créée à la volée)
   */
  async createRoom(roomName: string): Promise<void> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('LiveKit non configuré');
    }

    try {
      await this.roomService.createRoom({
        name: roomName,
        emptyTimeout: 300, // 5 minutes
        maxParticipants: 10,
      });
      this.logger.log(`Room créée: ${roomName}`);
    } catch (error: any) {
      this.logger.error(`Erreur lors de la création de la room ${roomName}:`, error.message);
      throw error;
    }
  }

  /**
   * Démarre l'enregistrement d'une room
   * Note: L'enregistrement est géré via les webhooks LiveKit
   * Cette méthode prépare le terrain pour l'enregistrement
   */
  async startRecording(roomName: string, outputUrl?: string): Promise<string> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('LiveKit non configuré');
    }

    try {
      // LiveKit gère l'enregistrement via la configuration du serveur
      // On peut utiliser l'API Egress pour démarrer un enregistrement
      // Pour l'instant, on log juste que l'enregistrement devrait démarrer
      // L'enregistrement réel sera géré par la configuration LiveKit côté serveur
      this.logger.log(`Enregistrement configuré pour ${roomName}`);
      
      // Retourner un ID fictif pour l'instant
      // L'enregistrement réel sera notifié via webhook
      return `rec_${roomName}_${Date.now()}`;
    } catch (error: any) {
      this.logger.error(`Erreur lors du démarrage de l'enregistrement:`, error.message);
      throw error;
    }
  }

  /**
   * Arrête l'enregistrement d'une room
   * Note: L'enregistrement est géré via les webhooks LiveKit
   */
  async stopRecording(recordingId: string): Promise<void> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('LiveKit non configuré');
    }

    try {
      // L'arrêt de l'enregistrement est géré automatiquement par LiveKit
      // quand la room se vide ou via webhook
      this.logger.log(`Arrêt de l'enregistrement demandé: ${recordingId}`);
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'arrêt de l'enregistrement:`, error.message);
      throw error;
    }
  }

  /**
   * Récupère l'URL du serveur LiveKit
   */
  getServerUrl(): string {
    return this.serverUrl;
  }

  /**
   * Vérifie si LiveKit est configuré
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret && this.serverUrl);
  }
}

