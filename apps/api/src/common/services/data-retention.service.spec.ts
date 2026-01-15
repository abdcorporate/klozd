import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataRetentionService } from './data-retention.service';
import { PrismaService } from '../../prisma/prisma.service';
import { subDays } from 'date-fns';

describe('DataRetentionService', () => {
  let service: DataRetentionService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    formAbandon: {
      deleteMany: jest.fn(),
    },
    notification: {
      deleteMany: jest.fn(),
    },
    idempotencyKey: {
      deleteMany: jest.fn(),
    },
    auditLog: {
      deleteMany: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        RETENTION_FORM_ABANDON_DAYS: '90',
        RETENTION_NOTIFICATION_DAYS: '180',
        RETENTION_AUDIT_LOG_DAYS: '365',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataRetentionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DataRetentionService>(DataRetentionService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('purgeFormAbandons', () => {
    it('should purge FormAbandon records older than 90 days', async () => {
      const mockCount = 5;
      mockPrismaService.formAbandon.deleteMany.mockResolvedValue({ count: mockCount });

      const result = await service.purgeFormAbandons();

      expect(result).toBe(mockCount);
      expect(mockPrismaService.formAbandon.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date),
          },
        },
      });

      // Vérifier que la date de coupure est bien 90 jours avant aujourd'hui
      const callArgs = mockPrismaService.formAbandon.deleteMany.mock.calls[0][0];
      const cutoffDate = callArgs.where.createdAt.lt;
      const expectedCutoff = subDays(new Date(), 90);
      const diffInDays = Math.abs((expectedCutoff.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffInDays).toBeLessThan(1); // Tolérance de 1 jour
    });

    it('should return 0 when no records to purge', async () => {
      mockPrismaService.formAbandon.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.purgeFormAbandons();

      expect(result).toBe(0);
    });
  });

  describe('purgeNotifications', () => {
    it('should purge read Notification records older than 180 days', async () => {
      const mockCount = 10;
      mockPrismaService.notification.deleteMany.mockResolvedValue({ count: mockCount });

      const result = await service.purgeNotifications();

      expect(result).toBe(mockCount);
      expect(mockPrismaService.notification.deleteMany).toHaveBeenCalledWith({
        where: {
          status: 'READ',
          readAt: {
            not: null,
            lt: expect.any(Date),
          },
        },
      });

      // Vérifier que la date de coupure est bien 180 jours avant aujourd'hui
      const callArgs = mockPrismaService.notification.deleteMany.mock.calls[0][0];
      const cutoffDate = callArgs.where.readAt.lt;
      const expectedCutoff = subDays(new Date(), 180);
      const diffInDays = Math.abs((expectedCutoff.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffInDays).toBeLessThan(1);
    });

    it('should return 0 when no records to purge', async () => {
      mockPrismaService.notification.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.purgeNotifications();

      expect(result).toBe(0);
    });
  });

  describe('purgeIdempotencyKeys', () => {
    it('should purge expired IdempotencyKey records', async () => {
      const mockCount = 15;
      mockPrismaService.idempotencyKey.deleteMany.mockResolvedValue({ count: mockCount });

      const result = await service.purgeIdempotencyKeys();

      expect(result).toBe(mockCount);
      expect(mockPrismaService.idempotencyKey.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      });

      // Vérifier que la date de coupure est maintenant ou dans le passé
      const callArgs = mockPrismaService.idempotencyKey.deleteMany.mock.calls[0][0];
      const cutoffDate = callArgs.where.expiresAt.lt;
      expect(cutoffDate.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should return 0 when no records to purge', async () => {
      mockPrismaService.idempotencyKey.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.purgeIdempotencyKeys();

      expect(result).toBe(0);
    });
  });

  describe('purgeAuditLogs', () => {
    it('should purge AuditLog records older than 365 days', async () => {
      const mockCount = 20;
      mockPrismaService.auditLog.deleteMany.mockResolvedValue({ count: mockCount });

      const result = await service.purgeAuditLogs();

      expect(result).toBe(mockCount);
      expect(mockPrismaService.auditLog.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date),
          },
        },
      });

      // Vérifier que la date de coupure est bien 365 jours avant aujourd'hui
      const callArgs = mockPrismaService.auditLog.deleteMany.mock.calls[0][0];
      const cutoffDate = callArgs.where.createdAt.lt;
      const expectedCutoff = subDays(new Date(), 365);
      const diffInDays = Math.abs((expectedCutoff.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffInDays).toBeLessThan(1);
    });

    it('should return 0 when no records to purge', async () => {
      mockPrismaService.auditLog.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.purgeAuditLogs();

      expect(result).toBe(0);
    });
  });

  describe('runAllPurges', () => {
    it('should run all purge methods and return aggregated stats', async () => {
      mockPrismaService.formAbandon.deleteMany.mockResolvedValue({ count: 5 });
      mockPrismaService.notification.deleteMany.mockResolvedValue({ count: 10 });
      mockPrismaService.idempotencyKey.deleteMany.mockResolvedValue({ count: 15 });
      mockPrismaService.auditLog.deleteMany.mockResolvedValue({ count: 20 });

      const stats = await service.runAllPurges();

      expect(stats).toEqual({
        formAbandons: 5,
        notifications: 10,
        idempotencyKeys: 15,
        auditLogs: 20,
        total: 50,
      });

      expect(mockPrismaService.formAbandon.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.notification.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.idempotencyKey.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.auditLog.deleteMany).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockPrismaService.formAbandon.deleteMany.mockRejectedValue(new Error('Database error'));

      await expect(service.runAllPurges()).rejects.toThrow('Database error');
    });

    it('should use custom retention days from environment', async () => {
      const customConfigService = {
        get: jest.fn((key: string) => {
          const config: Record<string, string> = {
            RETENTION_FORM_ABANDON_DAYS: '60',
            RETENTION_NOTIFICATION_DAYS: '120',
            RETENTION_AUDIT_LOG_DAYS: '730',
          };
          return config[key];
        }),
      };

      const customModule: TestingModule = await Test.createTestingModule({
        providers: [
          DataRetentionService,
          {
            provide: PrismaService,
            useValue: mockPrismaService,
          },
          {
            provide: ConfigService,
            useValue: customConfigService,
          },
        ],
      }).compile();

      const customService = customModule.get<DataRetentionService>(DataRetentionService);

      mockPrismaService.formAbandon.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.notification.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.idempotencyKey.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.auditLog.deleteMany.mockResolvedValue({ count: 1 });

      await customService.runAllPurges();

      // Vérifier que les dates de coupure utilisent les valeurs personnalisées
      const formAbandonCall = mockPrismaService.formAbandon.deleteMany.mock.calls[0][0];
      const formAbandonCutoff = formAbandonCall.where.createdAt.lt;
      const expectedFormAbandonCutoff = subDays(new Date(), 60);
      const formAbandonDiff = Math.abs(
        (expectedFormAbandonCutoff.getTime() - formAbandonCutoff.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(formAbandonDiff).toBeLessThan(1);

      const auditLogCall = mockPrismaService.auditLog.deleteMany.mock.calls[0][0];
      const auditLogCutoff = auditLogCall.where.createdAt.lt;
      const expectedAuditLogCutoff = subDays(new Date(), 730);
      const auditLogDiff = Math.abs(
        (expectedAuditLogCutoff.getTime() - auditLogCutoff.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(auditLogDiff).toBeLessThan(1);
    });
  });
});
