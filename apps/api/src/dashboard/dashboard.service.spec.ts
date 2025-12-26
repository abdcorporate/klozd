import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    lead: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    deal: {
      count: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    appointment: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    team: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCEODashboard', () => {
    it('should return ADMIN dashboard data', async () => {
      const organizationId = 'org-id';
      const mockData = {
        totalLeads: 100,
        qualifiedLeads: 50,
        pipelineValue: 50000,
        wonValue: 25000,
      };

      mockPrismaService.lead.count
        .mockResolvedValueOnce(100) // totalLeads
        .mockResolvedValueOnce(50); // qualifiedLeads
      const mockDeals = [
        { value: 50000, status: 'ACTIVE' },
        { value: 25000, status: 'WON', closedAt: new Date() },
      ];
      const mockClosers = [
        {
          id: 'closer-1',
          firstName: 'John',
          lastName: 'Doe',
          assignedAppointments: Array(10).fill({}),
          createdDeals: Array(5).fill({ value: 1000 }),
        },
      ];
      const mockAppointments = [
        {
          id: 'apt-1',
          scheduledAt: new Date(),
          lead: { id: 'lead-1', firstName: 'Test', lastName: 'Lead', aiPrediction: null },
          assignedCloser: { id: 'closer-1', firstName: 'John', lastName: 'Doe' },
        },
      ];

      mockPrismaService.deal.findMany
        .mockResolvedValueOnce(mockDeals.filter(d => d.status === 'ACTIVE'))
        .mockResolvedValueOnce(mockDeals.filter(d => d.status === 'WON'));
      mockPrismaService.appointment.count
        .mockResolvedValueOnce(20) // appointments
        .mockResolvedValueOnce(15) // completedAppointments
        .mockResolvedValueOnce(5); // noShows
      mockPrismaService.user.findMany.mockResolvedValue(mockClosers);
      mockPrismaService.appointment.findMany.mockResolvedValue(mockAppointments);

      const result = await service.getCeoDashboard(organizationId);

      expect(result).toHaveProperty('overview');
      expect(result.overview).toHaveProperty('totalLeads');
    });
  });

  describe('getManagerDashboard', () => {
    it('should return Manager dashboard data', async () => {
      const organizationId = 'org-id';
      const managerId = 'manager-id';

      const mockTeams = [
        {
          id: 'team-1',
          members: [{ id: 'user-1' }, { id: 'user-2' }],
        },
      ];
      const mockLeads = Array(50).fill({ id: 'lead-id', organizationId });
      const mockDeals = [];
      const mockUsers = [];

      mockPrismaService.team.findMany.mockResolvedValue(mockTeams);
      mockPrismaService.lead.findMany.mockResolvedValue(mockLeads);
      mockPrismaService.lead.count.mockResolvedValue(50);
      mockPrismaService.deal.findMany.mockResolvedValue(mockDeals);
      mockPrismaService.appointment.count.mockResolvedValue(10);
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getManagerDashboard(organizationId, managerId);

      expect(result).toHaveProperty('overview');
    });
  });
});

