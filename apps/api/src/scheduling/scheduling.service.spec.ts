import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { PrismaService } from '../prisma/prisma.service';
import { AttributionService } from './services/attribution.service';
import { VisioService } from './services/visio.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/scheduling.dto';

describe('SchedulingService', () => {
  let service: SchedulingService;
  let prismaService: PrismaService;
  let attributionService: AttributionService;

  const mockPrismaService = {
    appointment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    lead: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    team: {
      findMany: jest.fn(),
    },
  };

  const mockAttributionService = {
    assignLeadToCloser: jest.fn(),
  };

  const mockVisioService = {
    generateMeetingLink: jest.fn(),
    createMeeting: jest.fn(),
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AttributionService,
          useValue: mockAttributionService,
        },
        {
          provide: VisioService,
          useValue: mockVisioService,
        },
      ],
    }).compile();

    service = module.get<SchedulingService>(SchedulingService);
    prismaService = module.get<PrismaService>(PrismaService);
    attributionService = module.get<AttributionService>(AttributionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const organizationId = 'org-id';
    const createAppointmentDto: CreateAppointmentDto = {
      leadId: 'lead-id',
      scheduledAt: new Date('2024-12-31T10:00:00Z'),
      duration: 30,
      notes: 'Test appointment',
    };

    it('should create an appointment successfully', async () => {
      mockPrismaService.lead.findFirst.mockResolvedValue({
        id: 'lead-id',
        organizationId,
      });
      const mockCloser = { id: 'closer-id', firstName: 'John', lastName: 'Doe' };
      mockAttributionService.assignLeadToCloser.mockResolvedValue(mockCloser);
      mockVisioService.createMeeting = jest.fn().mockResolvedValue({
        meetingUrl: 'https://meet.example.com/123',
        meetingId: 'meeting-123',
      });
      mockPrismaService.lead.update.mockResolvedValue({
        id: 'lead-id',
        assignedCloserId: 'closer-id',
      });
      mockPrismaService.appointment.create.mockResolvedValue({
        id: 'appointment-id',
        ...createAppointmentDto,
        organizationId,
        leadId: 'lead-id',
        assignedCloserId: 'closer-id',
        visioUrl: 'https://meet.example.com/123',
        visioMeetingId: 'meeting-123',
        status: 'SCHEDULED',
      });

      const result = await service.createAppointment(organizationId, 'lead-id', createAppointmentDto);

      expect(result).toHaveProperty('id');
      expect(mockPrismaService.appointment.create).toHaveBeenCalled();
      expect(mockAttributionService.assignLeadToCloser).toHaveBeenCalled();
    });

    it('should throw NotFoundException if lead not found', async () => {
      mockPrismaService.lead.findFirst.mockResolvedValue(null);

      await expect(
        service.createAppointment(organizationId, 'non-existent', createAppointmentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all appointments for an organization', async () => {
      const organizationId = 'org-id';
      const mockAppointments = [
        { id: 'apt-1', leadId: 'lead-1', organizationId, lead: { organizationId }, assignedCloser: {} },
        { id: 'apt-2', leadId: 'lead-2', organizationId, lead: { organizationId }, assignedCloser: {} },
      ];

      mockPrismaService.team.findMany.mockResolvedValue([]);
      mockPrismaService.appointment.findMany.mockResolvedValue(mockAppointments);
      mockPrismaService.appointment.count.mockResolvedValue(2);

      const result = await service.findAll(organizationId, 'user-id', 'ADMIN');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(2);
      expect(result.meta.total).toBe(2);
      expect(mockPrismaService.appointment.findMany).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an appointment successfully', async () => {
      const appointmentId = 'appointment-id';
      const organizationId = 'org-id';
      const updateAppointmentDto: UpdateAppointmentDto = {
        scheduledAt: new Date('2024-12-31T11:00:00Z'),
        duration: 60,
      };

      mockPrismaService.appointment.findFirst.mockResolvedValue({
        id: appointmentId,
        organizationId,
      });
      mockPrismaService.appointment.update.mockResolvedValue({
        id: appointmentId,
        ...updateAppointmentDto,
      });

      const result = await service.update(appointmentId, organizationId, updateAppointmentDto);

      expect(result).toHaveProperty('duration', 60);
      expect(mockPrismaService.appointment.update).toHaveBeenCalled();
    });
  });
});

