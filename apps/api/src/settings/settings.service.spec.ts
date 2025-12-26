import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from './pricing.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    organizationSettings: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPricingService = {
    getAllPlans: jest.fn(),
    getPlan: jest.fn(),
    getPlanFeatures: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PricingService,
          useValue: mockPricingService,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return settings for an organization', async () => {
      const organizationId = 'org-id';
      const mockSettings = {
        id: 'settings-id',
        organizationId,
        subscriptionPlan: 'solo',
        maxForms: 5,
        maxLeadsPerMonth: 500,
        callRecordingEnabled: true,
        organization: {
          id: 'org-id',
          name: 'Test Org',
          slug: 'test-org',
          logoUrl: null,
          timezone: 'Europe/Paris',
          currency: 'EUR',
        },
      };

      mockPrismaService.organizationSettings.findUnique.mockResolvedValue(
        mockSettings,
      );
      mockPrismaService.organizationSettings.update.mockResolvedValue(mockSettings);

      const result = await service.getSettings(organizationId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('organizationId');
      expect(mockPrismaService.organizationSettings.findUnique).toHaveBeenCalledWith(
        {
          where: { organizationId },
          include: expect.any(Object),
        },
      );
    });

    it('should create default settings if not found', async () => {
      const organizationId = 'org-id';
      const mockSettings = {
        id: 'settings-id',
        organizationId,
        subscriptionPlan: 'solo',
        organization: {
          id: 'org-id',
          name: 'Test Org',
          slug: 'test-org',
          logoUrl: null,
          timezone: 'Europe/Paris',
          currency: 'EUR',
        },
      };

      mockPrismaService.organizationSettings.findUnique.mockResolvedValue(null);
      mockPrismaService.organizationSettings.create.mockResolvedValue(mockSettings);

      const result = await service.getSettings(organizationId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('organizationId');
      expect(mockPrismaService.organizationSettings.create).toHaveBeenCalled();
    });
  });

  describe('updateSettings', () => {
    it('should update settings successfully', async () => {
      const organizationId = 'org-id';
      const updateDto = {
        subscriptionPlan: 'pro',
        callRecordingEnabled: true,
      };

      const existingSettings = {
        id: 'settings-id',
        organizationId,
        subscriptionPlan: 'solo',
        callRecordingEnabled: true,
        organization: {
          id: 'org-id',
          name: 'Test Org',
          slug: 'test-org',
          logoUrl: null,
          timezone: 'Europe/Paris',
          currency: 'EUR',
        },
      };
      mockPrismaService.organizationSettings.findUnique.mockResolvedValue(existingSettings);
      mockPricingService.getPlanFeatures.mockReturnValue({
        maxForms: 20,
        maxLeadsPerMonth: 2000,
        maxUsers: 10,
        maxAppointmentsPerMonth: 100,
        maxSmsPerMonth: 500,
        aiEnabled: true,
        whatsappEnabled: true,
        smsEnabled: true,
      });
      mockPricingService.getPlan.mockReturnValue({
        id: 'pro',
        name: 'Pro',
        monthlyPrice: 197,
      });
      mockPrismaService.organizationSettings.update.mockResolvedValue({
        ...existingSettings,
        ...updateDto,
      });

      const result = await service.updateSettings(organizationId, updateDto);

      expect(result).toHaveProperty('subscriptionPlan');
      expect(mockPricingService.getPlan).toHaveBeenCalledWith('pro');
      expect(mockPrismaService.organizationSettings.update).toHaveBeenCalled();
    });
  });
});

