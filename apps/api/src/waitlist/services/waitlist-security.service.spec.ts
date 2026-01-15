import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { WaitlistSecurityService } from './waitlist-security.service';

describe('WaitlistSecurityService', () => {
  let service: WaitlistSecurityService;
  let prisma: PrismaService;

  const mockPrismaService = {
    waitlistEntry: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistSecurityService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'TRUST_PROXY') return 'false';
              return undefined;
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WaitlistSecurityService>(WaitlistSecurityService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateEmail', () => {
    it('should accept valid email', async () => {
      await expect(service.validateEmail('test@example.com')).resolves.not.toThrow();
    });

    it('should reject disposable email', async () => {
      await expect(service.validateEmail('test@10minutemail.com')).rejects.toThrow(
        'Les emails temporaires ne sont pas autorisés',
      );
    });

    it('should reject invalid format', async () => {
      await expect(service.validateEmail('invalid-email')).rejects.toThrow();
    });

    it('should reject email that is too long', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      await expect(service.validateEmail(longEmail)).rejects.toThrow('Email trop long');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove control characters', () => {
      const input = 'test\x00\x1F\x7Fstring';
      expect(service.sanitizeInput(input)).toBe('teststring');
    });

    it('should trim whitespace', () => {
      expect(service.sanitizeInput('  test  ')).toBe('test');
    });

    it('should limit length', () => {
      const longInput = 'a'.repeat(300);
      expect(service.sanitizeInput(longInput, 100)).toHaveLength(100);
    });

    it('should return undefined for empty input', () => {
      expect(service.sanitizeInput('')).toBeUndefined();
      expect(service.sanitizeInput(null)).toBeUndefined();
      expect(service.sanitizeInput(undefined)).toBeUndefined();
    });
  });

  describe('detectSuspiciousActivity', () => {
    it('should detect multiple IPs for same email', async () => {
      mockPrismaService.waitlistEntry.findMany.mockResolvedValueOnce([
        { ip: '1.2.3.4' },
        { ip: '5.6.7.8' },
      ]);

      const result = await service.detectSuspiciousActivity(
        'test@example.com',
        '9.10.11.12',
        'Mozilla/5.0',
      );

      expect(result.suspicious).toBe(true);
      expect(result.reason).toContain('IPs différentes');
    });

    it('should detect too many entries from same IP', async () => {
      mockPrismaService.waitlistEntry.findMany
        .mockResolvedValueOnce([]) // First call (email check)
        .mockResolvedValueOnce(
          Array(11).fill({ ip: '1.2.3.4' }), // Second call (IP check)
        );

      const result = await service.detectSuspiciousActivity(
        'test@example.com',
        '1.2.3.4',
        'Mozilla/5.0',
      );

      expect(result.suspicious).toBe(true);
      expect(result.reason).toContain('Trop d\'inscriptions');
    });

    it('should not flag legitimate activity', async () => {
      mockPrismaService.waitlistEntry.findMany.mockResolvedValue([]);

      const result = await service.detectSuspiciousActivity(
        'test@example.com',
        '1.2.3.4',
        'Mozilla/5.0',
      );

      expect(result.suspicious).toBe(false);
    });
  });
});
