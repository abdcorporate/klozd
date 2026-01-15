import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { PinoLogger } from 'nestjs-pino';
import { MessageDeliveryService } from './message-delivery.service';
import { MessageProvider, MessageChannel, MessageDeliveryStatus } from '@prisma/client';

describe('MessageDeliveryService', () => {
  let service: MessageDeliveryService;
  let prisma: jest.Mocked<PrismaService>;
  let pinoLogger: jest.Mocked<PinoLogger>;

  beforeEach(async () => {
    const mockPrisma = {
      messageDelivery: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const mockPinoLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageDeliveryService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: PinoLogger,
          useValue: mockPinoLogger,
        },
      ],
    }).compile();

    service = module.get<MessageDeliveryService>(MessageDeliveryService);
    prisma = module.get(PrismaService);
    pinoLogger = module.get(PinoLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('computePayloadHash', () => {
    it('should generate same hash for same payload regardless of key order', () => {
      const payload1 = { to: 'test@example.com', subject: 'Hello', html: '<p>Hi</p>' };
      const payload2 = { subject: 'Hello', html: '<p>Hi</p>', to: 'test@example.com' };

      const hash1 = service.computePayloadHash(payload1);
      const hash2 = service.computePayloadHash(payload2);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA256 produces 64-char hex string
    });

    it('should generate different hash for different payloads', () => {
      const payload1 = { to: 'test@example.com', subject: 'Hello' };
      const payload2 = { to: 'test@example.com', subject: 'World' };

      const hash1 = service.computePayloadHash(payload1);
      const hash2 = service.computePayloadHash(payload2);

      expect(hash1).not.toBe(hash2);
    });

    it('should ignore undefined values in hash computation', () => {
      const payload1 = { to: 'test@example.com', subject: 'Hello', text: undefined };
      const payload2 = { to: 'test@example.com', subject: 'Hello' };

      const hash1 = service.computePayloadHash(payload1);
      const hash2 = service.computePayloadHash(payload2);

      expect(hash1).toBe(hash2);
    });

    it('should handle nested objects with sorted keys', () => {
      const payload1 = {
        to: 'test@example.com',
        metadata: { b: 'second', a: 'first' },
      };
      const payload2 = {
        to: 'test@example.com',
        metadata: { a: 'first', b: 'second' },
      };

      const hash1 = service.computePayloadHash(payload1);
      const hash2 = service.computePayloadHash(payload2);

      expect(hash1).toBe(hash2);
    });
  });

  describe('createOrGetDelivery', () => {
    const organizationId = 'org-123';
    const provider = MessageProvider.RESEND;
    const channel = MessageChannel.EMAIL;
    const to = 'test@example.com';
    const templateKey = 'appointment-confirmation';
    const payload = { to, subject: 'Hello', html: '<p>Hi</p>' };

    it('should return existing delivery if found', async () => {
      const existingDelivery = {
        id: 'delivery-123',
        status: MessageDeliveryStatus.SENT,
        providerMessageId: 'resend-123',
      };

      prisma.messageDelivery.findUnique.mockResolvedValue(existingDelivery as any);

      const result = await service.createOrGetDelivery(
        organizationId,
        provider,
        channel,
        to,
        templateKey,
        payload,
      );

      expect(result).toEqual(existingDelivery);
      expect(prisma.messageDelivery.findUnique).toHaveBeenCalledWith({
        where: {
          organizationId_channel_to_templateKey_payloadHash: {
            organizationId,
            channel,
            to,
            templateKey,
            payloadHash: expect.any(String),
          },
        },
        select: {
          id: true,
          status: true,
          providerMessageId: true,
        },
      });
      expect(prisma.messageDelivery.create).not.toHaveBeenCalled();
    });

    it('should create new delivery if not found', async () => {
      prisma.messageDelivery.findUnique.mockResolvedValue(null);
      const newDelivery = {
        id: 'delivery-456',
        status: MessageDeliveryStatus.PENDING,
        providerMessageId: null,
      };
      prisma.messageDelivery.create.mockResolvedValue(newDelivery as any);

      const result = await service.createOrGetDelivery(
        organizationId,
        provider,
        channel,
        to,
        templateKey,
        payload,
      );

      expect(result.id).toBe(newDelivery.id);
      expect(result.status).toBe(MessageDeliveryStatus.PENDING);
      expect(prisma.messageDelivery.create).toHaveBeenCalled();
    });

    it('should handle race condition (unique constraint violation)', async () => {
      prisma.messageDelivery.findUnique.mockResolvedValueOnce(null);
      const error = new Error('Unique constraint violation');
      (error as any).code = 'P2002';
      prisma.messageDelivery.create.mockRejectedValueOnce(error);

      const existingDelivery = {
        id: 'delivery-789',
        status: MessageDeliveryStatus.PENDING,
        providerMessageId: null,
      };
      prisma.messageDelivery.findUnique.mockResolvedValueOnce(existingDelivery as any);

      const result = await service.createOrGetDelivery(
        organizationId,
        provider,
        channel,
        to,
        templateKey,
        payload,
      );

      expect(result).toEqual(existingDelivery);
      expect(prisma.messageDelivery.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should handle null organizationId', async () => {
      prisma.messageDelivery.findUnique.mockResolvedValue(null);
      const newDelivery = {
        id: 'delivery-999',
        status: MessageDeliveryStatus.PENDING,
        providerMessageId: null,
      };
      prisma.messageDelivery.create.mockResolvedValue(newDelivery as any);

      await service.createOrGetDelivery(
        undefined,
        provider,
        channel,
        to,
        templateKey,
        payload,
      );

      expect(prisma.messageDelivery.create).toHaveBeenCalledWith({
        data: {
          organizationId: null,
          provider,
          channel,
          to,
          templateKey,
          payloadHash: expect.any(String),
          status: MessageDeliveryStatus.PENDING,
          metadataJson: null,
        },
      });
    });
  });

  describe('markSent', () => {
    it('should update delivery status to SENT', async () => {
      const deliveryId = 'delivery-123';
      const providerMessageId = 'resend-456';
      const updatedDelivery = {
        id: deliveryId,
        channel: MessageChannel.EMAIL,
        to: 'test@example.com',
        templateKey: 'test-template',
        status: MessageDeliveryStatus.SENT,
        providerMessageId,
      };

      prisma.messageDelivery.update.mockResolvedValue(updatedDelivery as any);

      await service.markSent(deliveryId, providerMessageId);

      expect(prisma.messageDelivery.update).toHaveBeenCalledWith({
        where: { id: deliveryId },
        data: {
          status: MessageDeliveryStatus.SENT,
          providerMessageId,
          sentAt: expect.any(Date),
        },
      });
      expect(pinoLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryId,
          channel: MessageChannel.EMAIL,
          to: 'test@example.com',
          templateKey: 'test-template',
          status: MessageDeliveryStatus.SENT,
          providerMessageId,
        }),
        expect.any(String),
      );
    });
  });

  describe('markFailed', () => {
    it('should update delivery status to FAILED with error code and message', async () => {
      const deliveryId = 'delivery-123';
      const errorCode = 'RATE_LIMIT';
      const errorMessage = 'Rate limit exceeded';
      const updatedDelivery = {
        id: deliveryId,
        channel: MessageChannel.EMAIL,
        to: 'test@example.com',
        templateKey: 'test-template',
        status: MessageDeliveryStatus.FAILED,
        errorCode,
        errorMessage,
      };

      prisma.messageDelivery.update.mockResolvedValue(updatedDelivery as any);

      await service.markFailed(deliveryId, errorCode, errorMessage);

      expect(prisma.messageDelivery.update).toHaveBeenCalledWith({
        where: { id: deliveryId },
        data: {
          status: MessageDeliveryStatus.FAILED,
          errorCode,
          errorMessage,
        },
      });
      expect(pinoLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryId,
          channel: MessageChannel.EMAIL,
          to: 'test@example.com',
          templateKey: 'test-template',
          status: MessageDeliveryStatus.FAILED,
          errorCode,
          errorMessage,
        }),
        expect.any(String),
      );
    });
  });
});
