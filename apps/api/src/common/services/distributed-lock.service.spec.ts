import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import Redis from 'ioredis';
import { DistributedLockService } from './distributed-lock.service';

// Mock ioredis
jest.mock('ioredis');

describe('DistributedLockService', () => {
  let service: DistributedLockService;
  let mockRedis: jest.Mocked<Redis>;
  let configService: ConfigService;
  let pinoLogger: PinoLogger;

  beforeEach(async () => {
    // Mock Redis instance
    mockRedis = {
      set: jest.fn(),
      del: jest.fn(),
      status: 'ready',
      on: jest.fn(),
      quit: jest.fn(),
    } as any;

    // Mock Redis constructor
    (Redis as any).mockImplementation(() => mockRedis);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributedLockService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                REDIS_ENABLED: 'true',
                REDIS_URL: 'redis://localhost:6379',
                DISABLE_CRONS_ON_REDIS_DOWN: 'false',
              };
              return config[key];
            }),
          },
        },
        {
          provide: PinoLogger,
          useValue: {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DistributedLockService>(DistributedLockService);
    configService = module.get<ConfigService>(ConfigService);
    pinoLogger = module.get<PinoLogger>(PinoLogger);

    // Wait for Redis initialization
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('acquire', () => {
    it('should return true when lock is acquired (first time)', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const result = await service.acquire('test-job', 5000);

      expect(result).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'locks:klozd:test-job',
        'locked',
        'PX',
        5000,
        'NX',
      );
    });

    it('should return false when lock is already acquired (second time)', async () => {
      mockRedis.set.mockResolvedValueOnce('OK'); // First call succeeds
      mockRedis.set.mockResolvedValueOnce(null); // Second call fails (lock exists)

      const result1 = await service.acquire('test-job', 5000);
      const result2 = await service.acquire('test-job', 5000);

      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(mockRedis.set).toHaveBeenCalledTimes(2);
    });

    it('should respect TTL when setting lock', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await service.acquire('test-job', 10000);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'locks:klozd:test-job',
        'locked',
        'PX',
        10000,
        'NX',
      );
    });

    it('should return false when Redis is unavailable and fallback mode is disable', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DistributedLockService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                const config: Record<string, string> = {
                  REDIS_ENABLED: 'true',
                  DISABLE_CRONS_ON_REDIS_DOWN: 'true', // Fail-closed mode
                };
                return config[key];
              }),
            },
          },
          {
            provide: PinoLogger,
            useValue: {
              info: jest.fn(),
              warn: jest.fn(),
              error: jest.fn(),
              debug: jest.fn(),
            },
          },
        ],
      }).compile();

      const serviceWithDisableMode = module.get<DistributedLockService>(DistributedLockService);
      // Simulate Redis unavailable
      (serviceWithDisableMode as any).redis = null;

      const result = await serviceWithDisableMode.acquire('test-job', 5000);

      expect(result).toBe(false);
      expect(pinoLogger.warn).toHaveBeenCalled();
    });

    it('should return true when Redis is unavailable and fallback mode is single-instance', async () => {
      // Simulate Redis unavailable
      (service as any).redis = null;

      const result = await service.acquire('test-job', 5000);

      expect(result).toBe(true);
      expect(pinoLogger.warn).toHaveBeenCalled();
    });
  });

  describe('withLock', () => {
    it('should execute function when lock is acquired', async () => {
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.del.mockResolvedValue(1);

      const fn = jest.fn().mockResolvedValue('result');

      const result = await service.withLock('test-job', 5000, fn);

      expect(result).toBe('result');
      expect(fn).toHaveBeenCalledTimes(1);
      expect(mockRedis.set).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalledWith('locks:klozd:test-job');
    });

    it('should not execute function when lock is not acquired', async () => {
      mockRedis.set.mockResolvedValue(null); // Lock already exists

      const fn = jest.fn().mockResolvedValue('result');

      const result = await service.withLock('test-job', 5000, fn);

      expect(result).toBeUndefined();
      expect(fn).not.toHaveBeenCalled();
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should release lock even if function throws an error', async () => {
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.del.mockResolvedValue(1);

      const fn = jest.fn().mockRejectedValue(new Error('Test error'));

      await expect(service.withLock('test-job', 5000, fn)).rejects.toThrow('Test error');

      expect(mockRedis.del).toHaveBeenCalledWith('locks:klozd:test-job');
    });

    it('should log execution duration', async () => {
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.del.mockResolvedValue(1);

      const fn = jest.fn().mockResolvedValue('result');

      await service.withLock('test-job', 5000, fn);

      expect(pinoLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          lockKey: 'locks:klozd:test-job',
          acquired: true,
          ttlMs: 5000,
          durationMs: expect.any(Number),
        }),
        expect.any(String),
      );
    });
  });

  describe('release', () => {
    it('should delete lock key when releasing', async () => {
      mockRedis.del.mockResolvedValue(1);

      await service.release('test-job');

      expect(mockRedis.del).toHaveBeenCalledWith('locks:klozd:test-job');
    });

    it('should not throw error if Redis is unavailable', async () => {
      (service as any).redis = null;

      await expect(service.release('test-job')).resolves.not.toThrow();
    });
  });
});
