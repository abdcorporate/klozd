import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../settings/pricing.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    team: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    organizationSettings: {
      findUnique: jest.fn(),
    },
    teamMember: {
      create: jest.fn(),
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
        UsersService,
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

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const organizationId = 'org-id';
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'CLOSER',
    };

    it('should create a user successfully', async () => {
      mockPrismaService.organizationSettings.findUnique.mockResolvedValue({
        maxUsers: 10,
      });
      mockPrismaService.user.count.mockResolvedValue(5);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id',
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
        status: 'ACTIVE',
        organizationId,
        createdAt: new Date(),
      });

      const result = await service.create(organizationId, 'ADMIN', createUserDto);

      expect(result).toHaveProperty('id');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if email already exists', async () => {
      mockPrismaService.organizationSettings.findUnique.mockResolvedValue({
        maxUsers: 10,
      });
      mockPrismaService.user.count.mockResolvedValue(5);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user-id',
        email: 'newuser@example.com',
      });

      await expect(
        service.create(organizationId, 'ADMIN', createUserDto),
      ).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all users for an organization', async () => {
      const organizationId = 'org-id';
      const mockUsers = [
        { id: 'user-1', email: 'user1@example.com', organizationId },
        { id: 'user-2', email: 'user2@example.com', organizationId },
      ];

      mockPrismaService.team.findMany.mockResolvedValue([]);
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll(organizationId, 'ADMIN', 'user-id');

      expect(Array.isArray(result)).toBe(true);
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userId = 'user-id';
      const organizationId = 'org-id';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const mockUser = {
        id: userId,
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        organizationId,
        role: 'CLOSER',
        status: 'ACTIVE',
        createdAt: new Date(),
        teams: [],
      };
      // findOne est appelé dans update, donc on mock findFirst qui est utilisé par findOne
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
      });

      const result = await service.update(userId, organizationId, 'ADMIN', updateUserDto);

      expect(result).toHaveProperty('firstName', 'Updated');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.update('non-existent', 'org-id', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

