import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createHash } from 'crypto';
import { MessageProvider, MessageChannel, MessageDeliveryStatus } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';

export interface MessageDeliveryData {
  organizationId?: string;
  provider: MessageProvider;
  channel: MessageChannel;
  to: string;
  templateKey?: string;
  payload: any; // Email/SMS/WhatsApp payload
  metadata?: Record<string, any>;
}

export interface MessageDeliveryResult {
  deliveryId: string;
  providerMessageId?: string;
  isDuplicate: boolean;
  status: MessageDeliveryStatus;
}

@Injectable()
export class MessageDeliveryService {
  private readonly logger = new Logger(MessageDeliveryService.name);

  constructor(
    private prisma: PrismaService,
    private pinoLogger: PinoLogger,
  ) {}

  /**
   * Generate canonical hash of payload for deduplication
   * Uses stable JSON serialization (sorted keys, no undefined values)
   * Public method for use in jobId generation
   */
  computePayloadHash(payload: any): string {
    // Normalize payload: remove undefined, sort keys recursively
    const normalized = this.normalizePayload(payload);
    const jsonString = JSON.stringify(normalized);
    return createHash('sha256').update(jsonString).digest('hex');
  }

  /**
   * Normalize payload for stable hashing:
   * - Sort object keys recursively
   * - Remove undefined values
   * - Ensure consistent ordering
   */
  private normalizePayload(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.normalizePayload(item));
    }

    if (typeof obj === 'object') {
      const normalized: Record<string, any> = {};
      const keys = Object.keys(obj).sort();
      
      for (const key of keys) {
        const value = obj[key];
        // Skip undefined values
        if (value !== undefined) {
          normalized[key] = this.normalizePayload(value);
        }
      }
      
      return normalized;
    }

    return obj;
  }

  /**
   * Create or get existing delivery record
   * Returns existing delivery if found (deduplication), or creates a new PENDING delivery
   */
  async createOrGetDelivery(
    organizationId: string | undefined,
    provider: MessageProvider,
    channel: MessageChannel,
    to: string,
    templateKey: string | undefined,
    payload: any,
    metadata?: Record<string, any>,
  ): Promise<{ id: string; status: MessageDeliveryStatus; providerMessageId?: string | null }> {
    const payloadHash = this.computePayloadHash(payload);

    // Try to find existing delivery
    // Note: Using findFirst because Prisma may not generate unique constraint name for composite with nullable fields
    // Temporary cast until Prisma client is regenerated
    const whereClause: any = {
      channel,
      to,
      payloadHash,
    };
    if (organizationId) {
      whereClause.organizationId = organizationId;
    } else {
      whereClause.organizationId = null;
    }
    if (templateKey) {
      whereClause.templateKey = templateKey;
    } else {
      whereClause.templateKey = null;
    }
    const existing = await this.prisma.messageDelivery.findFirst({
      where: whereClause,
      select: {
        id: true,
        status: true,
        providerMessageId: true,
      },
    });

    if (existing) {
      this.pinoLogger.info(
        {
          deliveryId: existing.id,
          channel,
          to,
          templateKey: templateKey || null,
          status: existing.status,
          providerMessageId: existing.providerMessageId,
          isDuplicate: true,
        },
        `Existing delivery found: ${channel} to ${to}`,
      );
      return existing;
    }

    // Create new delivery record
    try {
      const delivery = await this.prisma.messageDelivery.create({
        data: {
          ...(organizationId ? { organizationId } : {}),
          provider,
          channel,
          to,
          ...(templateKey ? { templateKey } : {}),
          payloadHash,
          status: MessageDeliveryStatus.PENDING,
          metadataJson: metadata ? JSON.stringify(metadata) : null,
        } as any,
      });

      this.pinoLogger.info(
        {
          deliveryId: delivery.id,
          channel,
          to,
          templateKey: templateKey || null,
          status: delivery.status,
          isDuplicate: false,
        },
        `New delivery created: ${channel} to ${to}`,
      );

      return {
        id: delivery.id,
        status: delivery.status,
        providerMessageId: null,
      };
    } catch (error: any) {
      // Handle unique constraint violation (race condition)
      if (error.code === 'P2002') {
        // Another process already created the record, fetch it
        const whereClauseAfterRace: any = {
          channel,
          to,
          payloadHash,
        };
        if (organizationId) {
          whereClauseAfterRace.organizationId = organizationId;
        } else {
          whereClauseAfterRace.organizationId = null;
        }
        if (templateKey) {
          whereClauseAfterRace.templateKey = templateKey;
        } else {
          whereClauseAfterRace.templateKey = null;
        }
        const existingAfterRace = await this.prisma.messageDelivery.findFirst({
          where: whereClauseAfterRace,
          select: {
            id: true,
            status: true,
            providerMessageId: true,
          },
        });

        if (existingAfterRace) {
          this.pinoLogger.info(
            {
              deliveryId: existingAfterRace.id,
              channel,
              to,
              templateKey: templateKey || null,
              status: existingAfterRace.status,
              providerMessageId: existingAfterRace.providerMessageId,
              isDuplicate: true,
            },
            `Existing delivery found after race condition: ${channel} to ${to}`,
          );
          return existingAfterRace;
        }
      }
      throw error;
    }
  }

  /**
   * Record message delivery attempt (legacy method, use createOrGetDelivery)
   * Returns delivery record with deduplication check
   * @deprecated Use createOrGetDelivery instead
   */
  async recordDelivery(
    data: MessageDeliveryData,
  ): Promise<MessageDeliveryResult> {
    const { organizationId, provider, channel, to, templateKey, payload, metadata } = data;
    
    const delivery = await this.createOrGetDelivery(
      organizationId,
      provider,
      channel,
      to,
      templateKey,
      payload,
      metadata,
    );

    const isDuplicate = delivery.status === MessageDeliveryStatus.SENT || 
                       delivery.status === MessageDeliveryStatus.DELIVERED;

    return {
      deliveryId: delivery.id,
      providerMessageId: delivery.providerMessageId ?? undefined,
      isDuplicate,
      status: delivery.status,
    };
  }

  /**
   * Update delivery status after sending
   */
  async markSent(
    deliveryId: string,
    providerMessageId?: string,
  ): Promise<void> {
    const delivery = await this.prisma.messageDelivery.update({
      where: { id: deliveryId },
      data: {
        status: MessageDeliveryStatus.SENT,
        providerMessageId: providerMessageId || null,
        sentAt: new Date(),
      },
    });

    this.pinoLogger.info(
      {
        deliveryId: delivery.id,
        channel: delivery.channel,
        to: delivery.to,
        templateKey: (delivery as any).templateKey || (delivery as any).template || null,
        status: delivery.status,
        providerMessageId: delivery.providerMessageId,
      },
      `Message delivery marked as SENT: ${deliveryId}`,
    );
  }

  /**
   * Legacy method name (use markSent instead)
   * @deprecated Use markSent instead
   */
  async markAsSent(deliveryId: string, providerMessageId?: string): Promise<void> {
    return this.markSent(deliveryId, providerMessageId);
  }

  /**
   * Update delivery status to delivered
   */
  async markAsDelivered(deliveryId: string): Promise<void> {
    await this.prisma.messageDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    });

    this.logger.log(`Message delivery marked as DELIVERED: ${deliveryId}`);
  }

  /**
   * Update delivery status to failed
   */
  async markFailed(
    deliveryId: string,
    errorCode?: string,
    errorMessage?: string,
  ): Promise<void> {
    const delivery = await this.prisma.messageDelivery.update({
      where: { id: deliveryId },
      data: {
        status: MessageDeliveryStatus.FAILED,
        ...(errorCode ? { errorCode } : {}),
        errorMessage: errorMessage || null,
      } as any,
    });

    this.pinoLogger.error(
      {
        deliveryId: delivery.id,
        channel: delivery.channel,
        to: delivery.to,
        templateKey: (delivery as any).templateKey || (delivery as any).template || null,
        status: delivery.status,
        errorCode: (delivery as any).errorCode || null,
        errorMessage: delivery.errorMessage,
      },
      `Message delivery marked as FAILED: ${deliveryId}`,
    );
  }

  /**
   * Legacy method name (use markFailed instead)
   * @deprecated Use markFailed instead
   */
  async markAsFailed(deliveryId: string, errorMessage: string): Promise<void> {
    return this.markFailed(deliveryId, undefined, errorMessage);
  }

  /**
   * Get delivery by ID
   */
  async getDelivery(deliveryId: string) {
    return this.prisma.messageDelivery.findUnique({
      where: { id: deliveryId },
    });
  }
}
