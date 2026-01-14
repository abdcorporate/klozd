import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { canCreateUserWithRole } from '../auth/permissions/permissions';
import { PricingService } from '../settings/pricing.service';
import {
  PaginationQueryDto,
  buildOrderBy,
  buildCursorWhere,
  extractCursor,
  PaginatedResponse,
} from '../common/pagination';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
  ) {}

  async create(organizationId: string, creatorRole: UserRole, createUserDto: CreateUserDto) {
    // Vérifier que le créateur peut créer ce type d'utilisateur
    if (!canCreateUserWithRole(creatorRole, createUserDto.role)) {
      throw new ForbiddenException(
        `Vous n'avez pas la permission de créer un utilisateur avec le rôle ${createUserDto.role}`,
      );
    }

    // Vérifier le quota d'utilisateurs
    const settings = await this.prisma.organizationSettings.findUnique({
      where: { organizationId },
    });

    if (settings) {
      const currentUserCount = await this.prisma.user.count({
        where: { organizationId, status: 'ACTIVE' },
      });

      if (currentUserCount >= settings.maxUsers) {
        throw new ForbiddenException(
          `Quota d'utilisateurs atteint (${settings.maxUsers}). Veuillez passer à un plan supérieur.`,
        );
      }
    }

    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
        status: 'ACTIVE',
        organizationId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        organizationId: true,
        createdAt: true,
      },
    });

    // Note: Les équipes ne sont plus utilisées, les managers voient tous les closers/setters de leur organisation

    return user;
  }

  async findAll(
    organizationId: string,
    creatorRole: UserRole,
    pagination: PaginationQueryDto,
    creatorId?: string,
  ): Promise<PaginatedResponse<any>> {
    const {
      limit = 25,
      cursor,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      q,
    } = pagination;

    let where: any = {};

    // SUPER_ADMIN voit tous les utilisateurs de toutes les organisations
    if (creatorRole === UserRole.SUPER_ADMIN) {
      // Pas de filtre d'organisation
    }
    // ADMIN voit tous les utilisateurs de son org
    else if (creatorRole === UserRole.ADMIN) {
      where.organizationId = organizationId;
    }
    // Manager : voir tous les utilisateurs de son organisation (sauf SUPER_ADMIN)
    else if (creatorRole === UserRole.MANAGER && creatorId) {
      where = {
        organizationId,
        role: {
          not: 'SUPER_ADMIN',
        },
      };
    }
    else {
      where.id = 'none'; // Aucun résultat
    }

    // Recherche textuelle (q)
    if (q) {
      const searchFilter = {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
        ],
      };

      if (where.id === 'none') {
        where = searchFilter;
      } else {
        where = {
          AND: [
            where,
            searchFilter,
          ],
        };
      }
    }

    // Cursor pagination
    const cursorWhere = buildCursorWhere(cursor, sortBy, sortOrder);
    if (cursorWhere) {
      where = {
        AND: [
          where,
          cursorWhere,
        ],
      };
    }

    // Ordering
    const orderBy = buildOrderBy(sortBy, sortOrder, { createdAt: 'desc', id: 'desc' });

    // Select fields based on role
    const selectFields = creatorRole === UserRole.SUPER_ADMIN
      ? {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          organizationId: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          createdAt: true,
        }
      : {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
        };

    // Fetch one extra item to determine if there's a next page
    const take = limit + 1;
    const data = await this.prisma.user.findMany({
      where,
      take,
      select: selectFields,
      orderBy,
    });

    // Check if there's a next page
    const hasNextPage = data.length > limit;
    const items = hasNextPage ? data.slice(0, limit) : data;

    // Extract cursor from last item
    const nextCursor = items.length > 0
      ? extractCursor(items[items.length - 1], sortBy)
      : null;

    return new PaginatedResponse(items, limit, nextCursor);
  }

  async findOne(id: string, organizationId: string, creatorRole?: UserRole) {
    // SUPER_ADMIN peut voir n'importe quel utilisateur
    const whereClause = creatorRole === UserRole.SUPER_ADMIN 
      ? { id }
      : { id, organizationId };

    const user = await this.prisma.user.findFirst({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        organizationId: creatorRole === UserRole.SUPER_ADMIN ? true : false,
        organization: creatorRole === UserRole.SUPER_ADMIN ? {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        } : false,
        closerSettings: {
          select: {
            pseudonyme: true,
            closingRate: true,
          },
        },
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async update(id: string, organizationId: string, creatorRole: UserRole, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id, organizationId, creatorRole);

    // Vérifier les permissions pour changer le rôle
    if (updateUserDto.role && updateUserDto.role !== user.role) {
      if (!canCreateUserWithRole(creatorRole, updateUserDto.role)) {
        throw new ForbiddenException(
          `Vous n'avez pas la permission d'assigner le rôle ${updateUserDto.role}`,
        );
      }
    }

    const updateData: any = { ...updateUserDto };

    // Hasher le nouveau mot de passe si fourni
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string, organizationId: string, creatorRole?: UserRole) {
    // SUPER_ADMIN peut supprimer n'importe quel utilisateur
    // ADMIN peut supprimer les utilisateurs de son organisation
    // Vérifier que l'utilisateur existe et que l'utilisateur a les permissions
    await this.findOne(id, organizationId, creatorRole);
    
    // Empêcher la suppression de soi-même (sécurité)
    // Note: Cette vérification devrait être faite au niveau du controller si nécessaire
    
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async activate(id: string, organizationId: string, creatorRole?: UserRole) {
    await this.findOne(id, organizationId, creatorRole);
    return this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }

  async deactivate(id: string, organizationId: string, creatorRole?: UserRole) {
    await this.findOne(id, organizationId, creatorRole);
    return this.prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}

