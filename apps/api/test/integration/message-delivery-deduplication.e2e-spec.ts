import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { QueueService } from '../../src/queue/queue.service';
import { MessageDeliveryService } from '../../src/notifications/services/message-delivery.service';
import { MessageProvider, MessageChannel, MessageDeliveryStatus } from '@prisma/client';

describe('MessageDelivery Deduplication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let queueService: QueueService;
  let messageDeliveryService: MessageDeliveryService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    queueService = moduleFixture.get<QueueService>(QueueService);
    messageDeliveryService = moduleFixture.get<MessageDeliveryService>(MessageDeliveryService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up message deliveries
    await prisma.messageDelivery.deleteMany({});
  });

  describe('createOrGetDelivery', () => {
    it('should return same delivery record for identical payloads', async () => {
      const organizationId = 'test-org-123';
      const provider = MessageProvider.RESEND;
      const channel = MessageChannel.EMAIL;
      const to = 'test@example.com';
      const templateKey = 'test-template';
      const payload = {
        to,
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
      };

      // First call - should create
      const delivery1 = await messageDeliveryService.createOrGetDelivery(
        organizationId,
        provider,
        channel,
        to,
        templateKey,
        payload,
      );

      expect(delivery1.status).toBe(MessageDeliveryStatus.PENDING);
      expect(delivery1.id).toBeDefined();

      // Second call with same payload - should return same delivery
      const delivery2 = await messageDeliveryService.createOrGetDelivery(
        organizationId,
        provider,
        channel,
        to,
        templateKey,
        payload,
      );

      expect(delivery2.id).toBe(delivery1.id);
      expect(delivery2.status).toBe(delivery1.status);

      // Verify only one record exists in DB
      const count = await prisma.messageDelivery.count({
        where: {
          organizationId,
          channel,
          to,
          templateKey,
        },
      });
      expect(count).toBe(1);
    });

    it('should create different deliveries for different payloads', async () => {
      const organizationId = 'test-org-456';
      const provider = MessageProvider.RESEND;
      const channel = MessageChannel.EMAIL;
      const to = 'test@example.com';
      const templateKey = 'test-template';

      const payload1 = {
        to,
        subject: 'Subject 1',
        html: '<p>HTML 1</p>',
      };

      const payload2 = {
        to,
        subject: 'Subject 2',
        html: '<p>HTML 2</p>',
      };

      const delivery1 = await messageDeliveryService.createOrGetDelivery(
        organizationId,
        provider,
        channel,
        to,
        templateKey,
        payload1,
      );

      const delivery2 = await messageDeliveryService.createOrGetDelivery(
        organizationId,
        provider,
        channel,
        to,
        templateKey,
        payload2,
      );

      expect(delivery1.id).not.toBe(delivery2.id);

      // Verify two records exist in DB
      const count = await prisma.messageDelivery.count({
        where: {
          organizationId,
          channel,
          to,
          templateKey,
        },
      });
      expect(count).toBe(2);
    });

    it('should handle payloads with different key order (same hash)', async () => {
      const organizationId = 'test-org-789';
      const provider = MessageProvider.RESEND;
      const channel = MessageChannel.EMAIL;
      const to = 'test@example.com';
      const templateKey = 'test-template';

      const payload1 = {
        to,
        subject: 'Hello',
        html: '<p>Hi</p>',
      };

      const payload2 = {
        html: '<p>Hi</p>',
        subject: 'Hello',
        to,
      };

      const delivery1 = await messageDeliveryService.createOrGetDelivery(
        organizationId,
        provider,
        channel,
        to,
        templateKey,
        payload1,
      );

      const delivery2 = await messageDeliveryService.createOrGetDelivery(
        organizationId,
        provider,
        channel,
        to,
        templateKey,
        payload2,
      );

      // Should return same delivery (same hash)
      expect(delivery1.id).toBe(delivery2.id);

      // Verify only one record exists
      const count = await prisma.messageDelivery.count({
        where: {
          organizationId,
          channel,
          to,
          templateKey,
        },
      });
      expect(count).toBe(1);
    });

    it('should prevent double send when status is SENT', async () => {
      const organizationId = 'test-org-sent';
      const provider = MessageProvider.RESEND;
      const channel = MessageChannel.EMAIL;
      const to = 'test@example.com';
      const templateKey = 'test-template';
      const payload = {
        to,
        subject: 'Test',
        html: '<p>Test</p>',
      };

      // Create and mark as sent
      const delivery = await messageDeliveryService.createOrGetDelivery(
        organizationId,
        provider,
        channel,
        to,
        templateKey,
        payload,
      );

      await messageDeliveryService.markSent(delivery.id, 'provider-msg-123');

      // Try to create again - should return same delivery with SENT status
      const delivery2 = await messageDeliveryService.createOrGetDelivery(
        organizationId,
        provider,
        channel,
        to,
        templateKey,
        payload,
      );

      expect(delivery2.id).toBe(delivery.id);
      expect(delivery2.status).toBe(MessageDeliveryStatus.SENT);
      expect(delivery2.providerMessageId).toBe('provider-msg-123');

      // Verify still only one record
      const count = await prisma.messageDelivery.count({
        where: {
          organizationId,
          channel,
          to,
          templateKey,
        },
      });
      expect(count).toBe(1);
    });
  });
});
