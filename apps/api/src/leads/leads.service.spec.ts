import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from './services/scoring.service';
import { PricingService } from '../settings/pricing.service';
import { SubmitFormDto } from './dto/leads.dto';

describe('LeadsService', () => {
  let service: LeadsService;
  let prismaService: PrismaService;
  let scoringService: ScoringService;

  const mockPrismaService = {
    lead: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    form: {
      findFirst: jest.fn(),
    },
    formSubmission: {
      create: jest.fn(),
    },
    formAbandon: {
      updateMany: jest.fn(),
    },
    organizationSettings: {
      findUnique: jest.fn(),
    },
  };

  const mockScoringService = {
    calculateScore: jest.fn(),
    extractLeadInfo: jest.fn(),
  };

  const mockPricingService = {
    getAllPlans: jest.fn(),
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ScoringService,
          useValue: mockScoringService,
        },
        {
          provide: PricingService,
          useValue: mockPricingService,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    prismaService = module.get<PrismaService>(PrismaService);
    scoringService = module.get<ScoringService>(ScoringService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitForm', () => {
    const organizationId = 'org-id';
    const formId = 'form-id';
    const submitFormDto: SubmitFormDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+33123456789',
      data: { budget: '10000', sector: 'tech' },
    };

    it('should create a new lead successfully', async () => {
      const mockForm = {
        id: formId,
        name: 'Test Form',
        organizationId,
        minScore: 50,
        formFields: [],
      };

      mockPrismaService.organizationSettings.findUnique.mockResolvedValue({
        maxLeadsPerMonth: 1000,
      });
      mockPrismaService.lead.count.mockResolvedValue(100);
      mockPrismaService.form.findFirst.mockResolvedValue(mockForm);
      mockScoringService.calculateScore.mockReturnValue(75);
      mockScoringService.extractLeadInfo.mockReturnValue({
        budget: 10000,
        sector: 'tech',
      });
      mockPrismaService.lead.findFirst.mockResolvedValue(null);
      const mockLead = {
        id: 'lead-id',
        email: submitFormDto.email,
        firstName: submitFormDto.firstName,
        lastName: submitFormDto.lastName,
        phone: submitFormDto.phone,
        organizationId,
        formId,
        score: 75,
        status: 'QUALIFIED',
        qualified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.lead.create.mockResolvedValue(mockLead);
      mockPrismaService.formSubmission.create.mockResolvedValue({
        id: 'submission-id',
        formId,
        leadId: 'lead-id',
        data: submitFormDto.data,
      });
      mockPrismaService.formAbandon.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.submitForm(organizationId, formId, submitFormDto);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('lead');
      expect(mockScoringService.calculateScore).toHaveBeenCalled();
    });

    it('should throw NotFoundException if form not found', async () => {
      mockPrismaService.organizationSettings.findUnique.mockResolvedValue({
        maxLeadsPerMonth: 1000,
      });
      mockPrismaService.lead.count.mockResolvedValue(100);
      mockPrismaService.form.findFirst.mockResolvedValue(null);

      await expect(
        service.submitForm(organizationId, formId, submitFormDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if quota exceeded', async () => {
      mockPrismaService.organizationSettings.findUnique.mockResolvedValue({
        maxLeadsPerMonth: 1000,
      });
      mockPrismaService.lead.count.mockResolvedValue(1000);

      await expect(
        service.submitForm(organizationId, formId, submitFormDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

