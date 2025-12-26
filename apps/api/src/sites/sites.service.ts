import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteDto, UpdateSiteDto } from './dto/sites.dto';

@Injectable()
export class SitesService {
  constructor(private prisma: PrismaService) {}

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
  }

  async findAllForAdmin() {
    return this.prisma.site.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.site.findMany({
      where: { organizationId },
      include: {
        form: {
          include: {
            formFields: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, organizationId?: string) {
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

    // Si organizationId est fourni, vérifier que le site appartient à cette organisation
    if (organizationId && site.organizationId !== organizationId) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce site');
    }

    return site;
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

