import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { CreateSiteDto, UpdateSiteDto } from './dto/sites.dto';
import {
  PaginationQueryDto,
  buildOrderBy,
  buildCursorWhere,
  extractCursor,
  PaginatedResponse,
} from '../common/pagination';

@Injectable()
export class SitesService {
  constructor(
    private prisma: PrismaService,
    private tenantPrisma: TenantPrismaService,
  ) {}

  async create(organizationId: string, createSiteDto: CreateSiteDto) {
    const { formId, ...siteData } = createSiteDto;

    // Vérifier que le formulaire existe et appartient à la même organisation si formId est fourni
    if (formId) {
      const form = await this.prisma.form.findUnique({
        where: { id: formId },
      });

      if (!form) {
        throw new NotFoundException('Formulaire non trouvé');
      }

      if (form.organizationId !== organizationId) {
        throw new ForbiddenException('Vous ne pouvez pas utiliser un formulaire d\'une autre organisation');
      }
    }

    try {
      const site = await this.prisma.site.create({
        data: {
          ...siteData,
          organizationId,
          formId: formId || null,
          contentJson: siteData.contentJson || JSON.stringify({ sections: [] }),
        },
        include: {
          form: {
            include: {
              formFields: {
                orderBy: { order: 'asc' },
              },
            },
          },
          organization: true,
        },
      });

      return site;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[] | undefined;
          if (target && target.includes('slug')) {
            throw new BadRequestException(
              `Un site avec le slug "${createSiteDto.slug}" existe déjà. Veuillez choisir un autre slug.`,
            );
          }
        }
      }
      throw error;
    }
  }

  async findAllForAdmin(pagination: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    const {
      limit = 25,
      cursor,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      q,
    } = pagination;

    let where: any = {};

    // Recherche textuelle (q)
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
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

    // Fetch one extra item to determine if there's a next page
    const take = limit + 1;
    const data = await this.prisma.site.findMany({
      where,
      take,
      include: {
        form: {
          include: {
            formFields: {
              orderBy: { order: 'asc' },
            },
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
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

  async findAll(organizationId: string, pagination: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    const {
      limit = 25,
      cursor,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      q,
    } = pagination;

    let where: any = { organizationId };

    // Recherche textuelle (q)
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
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

    // Fetch one extra item to determine if there's a next page
    const take = limit + 1;
    const data = await this.prisma.site.findMany({
      where,
      take,
      include: {
        form: {
          include: {
            formFields: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
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

  async findOne(id: string, organizationId?: string) {
    if (!organizationId) {
      // Si pas d'organizationId, utiliser l'ancienne méthode (pour compatibilité)
      const site = await this.prisma.site.findUnique({
        where: { id },
        include: {
          form: {
            include: {
              formFields: {
                orderBy: { order: 'asc' },
              },
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!site) {
        throw new NotFoundException('Site non trouvé');
      }

      return site;
    }

    // Utiliser TenantPrismaService pour garantir l'isolation multi-tenant
    return this.tenantPrisma.site.findUnique(
      {
        where: { id },
        include: {
          form: {
            include: {
              formFields: {
                orderBy: { order: 'asc' },
              },
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      organizationId,
    );
  }

  async findBySlug(slug: string) {
    const site = await this.prisma.site.findUnique({
      where: { slug },
      include: {
        form: {
          include: {
            formFields: {
              orderBy: { order: 'asc' },
            },
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!site) {
      throw new NotFoundException('Site non trouvé');
    }

    if (site.status !== 'ACTIVE') {
      throw new NotFoundException('Site non disponible');
    }

    return site;
  }

  async update(id: string, organizationId: string, updateSiteDto: UpdateSiteDto) {
    // Vérifier que le site existe et appartient à l'organisation
    const existingSite = await this.prisma.site.findUnique({
      where: { id },
    });

    if (!existingSite) {
      throw new NotFoundException('Site non trouvé');
    }

    if (existingSite.organizationId !== organizationId) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce site');
    }

    // Si formId est fourni, vérifier qu'il existe et appartient à la même organisation
    if (updateSiteDto.formId) {
      const form = await this.prisma.form.findUnique({
        where: { id: updateSiteDto.formId },
      });

      if (!form) {
        throw new NotFoundException('Formulaire non trouvé');
      }

      if (form.organizationId !== organizationId) {
        throw new ForbiddenException('Vous ne pouvez pas utiliser un formulaire d\'une autre organisation');
      }
    }

    const { formId, ...siteData } = updateSiteDto;

    try {
      const site = await this.prisma.site.update({
      where: { id },
      data: {
        ...siteData,
        formId: formId !== undefined ? (formId || null) : undefined,
      },
      include: {
        form: {
          include: {
            formFields: {
              orderBy: { order: 'asc' },
            },
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

      return site;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[] | undefined;
          if (target && target.includes('slug')) {
            throw new BadRequestException(
              `Un site avec le slug "${updateSiteDto.slug}" existe déjà. Veuillez choisir un autre slug.`,
            );
          }
        }
      }
      throw error;
    }
  }

  async remove(id: string, organizationId: string) {
    // Vérifier que le site existe et appartient à l'organisation
    const existingSite = await this.prisma.site.findUnique({
      where: { id },
    });

    if (!existingSite) {
      throw new NotFoundException('Site non trouvé');
    }

    if (existingSite.organizationId !== organizationId) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce site');
    }

    await this.prisma.site.delete({
      where: { id },
    });

    return { message: 'Site supprimé avec succès' };
  }
}

