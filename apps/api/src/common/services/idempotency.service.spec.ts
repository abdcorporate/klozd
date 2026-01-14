import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IdempotencyService } from './idempotency.service';
import { Prisma } from '@prisma/client';

describe('IdempotencyService', () => {
  let service: IdempotencyService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    idempotencyRecord: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdempotencyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<IdempotencyService>(IdempotencyService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('storeResponse - concurrency handling', () => {
    const key = 'test-key-123';
    const route = '/test/route';
    const requestBody = { email: 'test@example.com', data: {} };
    const responseStatus = 200;
    const responseBody = { success: true, id: '123' };

    it('should handle concurrent requests and ensure only one write occurs', async () => {
      let createCallCount = 0;
      const createCallTimings: number[] = [];

      // Simulate two concurrent requests
      mockPrismaService.$transaction.mockImplementation(async (callback: any) => {
        createCallCount++;
        createCallTimings.push(Date.now());

        // First call succeeds
        if (createCallCount === 1) {
          return callback({
            idempotencyRecord: {
              create: jest.fn().mockResolvedValue({}),
            },
          });
        }

        // Second call fails with unique constraint violation
        const error = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint violation',
          {
            code: 'P2002',
            clientVersion: '6.1.0',
            meta: {
              target: ['key', 'route'],
            },
          } as any,
        );
        throw error;
      });

      // After first transaction succeeds, second will find existing record
      mockPrismaService.idempotencyRecord.findUnique.mockResolvedValue({
        id: 'existing-id',
        key,
        route,
        requestHash: service['hashRequest'](requestBody), // Same hash
        responseStatus: 200,
        responseBodyJson: JSON.stringify(responseBody),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Not expired
        organizationId: null,
        ip: null,
        createdAt: new Date(),
      });

      // Execute two concurrent requests
      const promises = [
        service.storeResponse(key, route, requestBody, responseStatus, responseBody),
        service.storeResponse(key, route, requestBody, responseStatus, responseBody),
      ];

      const results = await Promise.all(promises);

      // Both should succeed (no errors thrown)
      expect(results).toHaveLength(2);
      expect(results[0]).toBeUndefined();
      expect(results[1]).toBeUndefined();

      // Verify transaction was called (at least once, possibly twice)
      expect(mockPrismaService.$transaction).toHaveBeenCalled();

      // Verify that after unique violation, we checked for existing record
      expect(mockPrismaService.idempotencyRecord.findUnique).toHaveBeenCalledWith({
        where: {
          key_route: {
            key,
            route,
          },
        },
      });
    });

    it('should throw ConflictException when same key+route has different request hash', async () => {
      // First request succeeds
      mockPrismaService.$transaction.mockResolvedValueOnce(undefined);

      // Second request fails with unique violation
      mockPrismaService.$transaction.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError(
          'Unique constraint violation',
          {
            code: 'P2002',
            clientVersion: '6.1.0',
            meta: {
              target: ['key', 'route'],
            },
          } as any,
        ),
      );

      // Existing record has different hash
      const differentHash = 'different-hash-123';
      mockPrismaService.idempotencyRecord.findUnique.mockResolvedValue({
        id: 'existing-id',
        key,
        route,
        requestHash: differentHash, // Different hash!
        responseStatus: 200,
        responseBodyJson: JSON.stringify({ success: false }),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        organizationId: null,
        ip: null,
        createdAt: new Date(),
      });

      // First request
      await service.storeResponse(key, route, requestBody, responseStatus, responseBody);

      // Second request with different body (different hash)
      const differentBody = { email: 'different@example.com', data: {} };

      await expect(
        service.storeResponse(key, route, differentBody, responseStatus, responseBody),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle expired records in race condition', async () => {
      // First transaction fails with unique violation
      mockPrismaService.$transaction.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError(
          'Unique constraint violation',
          {
            code: 'P2002',
            clientVersion: '6.1.0',
            meta: {
              target: ['key', 'route'],
            },
          } as any,
        ),
      );

      // Existing record is expired
      const expiredDate = new Date(Date.now() - 1000); // 1 second ago
      mockPrismaService.idempotencyRecord.findUnique.mockResolvedValueOnce({
        id: 'existing-id',
        key,
        route,
        requestHash: service['hashRequest'](requestBody),
        responseStatus: 200,
        responseBodyJson: JSON.stringify(responseBody),
        expiresAt: expiredDate, // Expired!
        organizationId: null,
        ip: null,
        createdAt: new Date(),
      });

      // Delete expired record
      mockPrismaService.idempotencyRecord.delete.mockResolvedValueOnce({});

      // Retry succeeds
      mockPrismaService.$transaction.mockResolvedValueOnce(undefined);

      await service.storeResponse(key, route, requestBody, responseStatus, responseBody);

      // Should have deleted expired record
      expect(mockPrismaService.idempotencyRecord.delete).toHaveBeenCalledWith({
        where: {
          key_route: {
            key,
            route,
          },
        },
      });

      // Should have retried
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(2);
    });
  });

  describe('checkIdempotency', () => {
    it('should return stored response for same key+route+hash', async () => {
      const key = 'test-key';
      const route = '/test';
      const requestBody = { email: 'test@example.com' };
      const storedResponse = { success: true, id: '123' };

      // Mock cleanupExpired (called first)
      mockPrismaService.idempotencyRecord.deleteMany.mockResolvedValueOnce({ count: 0 });

      // Mock findUnique for the actual check
      mockPrismaService.idempotencyRecord.findUnique.mockResolvedValueOnce({
        id: 'record-id',
        key,
        route,
        requestHash: service['hashRequest'](requestBody),
        responseStatus: 200,
        responseBodyJson: JSON.stringify(storedResponse),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        organizationId: null,
        ip: null,
        createdAt: new Date(),
      });

      const result = await service.checkIdempotency(key, route, requestBody);

      expect(result).toEqual({
        status: 200,
        body: storedResponse,
      });
    });

    it('should return null for non-existent key', async () => {
      // Mock cleanupExpired (called first)
      mockPrismaService.idempotencyRecord.deleteMany.mockResolvedValueOnce({ count: 0 });

      // Mock findUnique returning null
      mockPrismaService.idempotencyRecord.findUnique.mockResolvedValueOnce(null);

      const result = await service.checkIdempotency('non-existent', '/test', {});

      expect(result).toBeNull();
    });
  });
});
