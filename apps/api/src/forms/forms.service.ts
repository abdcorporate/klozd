import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { CreateFormDto, UpdateFormDto } from './dto/forms.dto';
import { PricingService } from '../settings/pricing.service';
import { AuditLogService } from '../common/services/audit-log.service';
import {
  PaginationQueryDto,
  buildOrderBy,
  buildCursorWhere,
  extractCursor,
  PaginatedResponse,
} from '../common/pagination';

@Injectable()
export class FormsService {
  constructor(
    private prisma: PrismaService,
    private tenantPrisma: TenantPrismaService,
    private pricingService: PricingService,
    private auditLogService: AuditLogService,
  ) {}

  async create(organizationId: string, createFormDto: CreateFormDto) {
    // Vérifier le quota de formulaires
    const settings = await this.prisma.organizationSettings.findUnique({
      where: { organizationId },
    });

    if (settings) {
      const currentFormCount = await this.prisma.form.count({
        where: { organizationId },
      });

      if (currentFormCount >= settings.maxForms) {
        throw new ForbiddenException(
          `Quota de formulaires atteint (${settings.maxForms}). Veuillez passer à un plan supérieur.`,
        );
      }
    }

    // Séparer les champs du formulaire des champs de relation
    const { formFields, ...formData } = createFormDto;

    try {
      const form = await this.prisma.form.create({
        data: {
          ...formData,
          organizationId,
        },
        include: {
          formFields: true,
        },
      });

      // Si des formFields sont fournis, les créer
      if (formFields && formFields.length > 0) {
        await this.prisma.formField.createMany({
          data: formFields.map((field) => ({
            ...field,
            formId: form.id,
          })),
        });
      }

      return this.prisma.form.findUnique({
        where: { id: form.id },
        include: {
          formFields: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[] | undefined;
          if (target && target.includes('slug')) {
            throw new BadRequestException(
              `Un formulaire avec le slug "${createFormDto.slug}" existe déjà. Veuillez choisir un autre slug.`,
            );
          }
        }
      }
      throw error;
    }
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
    const data = await this.prisma.form.findMany({
      where,
      take,
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            submissions: true,
            leads: true,
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
    const data = await this.prisma.form.findMany({
      where,
      take,
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            submissions: true,
            leads: true,
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

  async findOne(id: string, organizationId: string) {
    console.log(`[FormsService.findOne] Looking for form ${id} in organization ${organizationId}`);
    
    // Utiliser TenantPrismaService pour garantir l'isolation multi-tenant
    const form = await this.tenantPrisma.form.findUnique(
      {
        where: { id },
        include: {
          formFields: {
            orderBy: { order: 'asc' },
          },
        },
      },
      organizationId,
    );

    console.log(`[FormsService.findOne] Success: returning form ${form.name}`);
    return form;
  }

  async findOneForAdmin(id: string) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Formulaire non trouvé');
    }

    return form;
  }

  async findBySlug(slug: string) {
    const form = await this.prisma.form.findUnique({
      where: { slug },
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form || form.status !== 'ACTIVE') {
      throw new NotFoundException('Formulaire non trouvé ou inactif');
    }

    return form;
  }

  async update(id: string, organizationId: string, updateFormDto: UpdateFormDto, userId?: string, reqMeta?: { ip?: string; userAgent?: string }) {
    // Récupérer l'état avant pour l'audit log
    const beforeForm = await this.tenantPrisma.form.findUnique(
      {
        where: { id },
        include: {
          formFields: true,
        },
      },
      organizationId,
    );

    // Séparer les champs du formulaire des champs de relation
    const { formFields, ...formData } = updateFormDto;

    // Déterminer l'action pour l'audit log
    let action = 'UPDATE';
    if (updateFormDto.status === 'ACTIVE' && beforeForm?.status !== 'ACTIVE') {
      action = 'PUBLISH';
    } else if (updateFormDto.status && updateFormDto.status !== beforeForm?.status) {
      action = 'STATUS_CHANGE';
    }

    try {
      // Utiliser TenantPrismaService pour garantir l'isolation multi-tenant
      const updatedForm = await this.tenantPrisma.form.update(
        {
          where: { id },
          data: formData,
          include: {
            formFields: true,
          },
        },
        organizationId,
      );

    // Si des formFields sont fournis, supprimer les anciens et créer les nouveaux
    if (formFields && formFields.length > 0) {
      // Supprimer tous les champs existants
      await this.prisma.formField.deleteMany({
        where: { formId: id },
      });

      // Créer les nouveaux champs
      await this.prisma.formField.createMany({
        data: formFields.map((field) => ({
          ...field,
          formId: id,
        })),
      });
    }
    
      // Récupérer le formulaire final pour l'audit log
      const finalForm = await this.tenantPrisma.form.findUnique(
        {
          where: { id },
          include: {
            formFields: {
              orderBy: { order: 'asc' },
            },
          },
        },
        organizationId,
      );

      // Audit log
      await this.auditLogService.logChange({
        actor: userId ? { id: userId } : null,
        orgId: organizationId,
        action,
        entityType: 'FORM',
        entityId: id,
        before: {
          name: beforeForm?.name,
          status: beforeForm?.status,
          slug: beforeForm?.slug,
          formFieldsCount: (beforeForm as any)?.formFields?.length || 0,
        },
        after: {
          name: finalForm?.name,
          status: finalForm?.status,
          slug: finalForm?.slug,
          formFieldsCount: (finalForm as any)?.formFields?.length || 0,
        },
        reqMeta,
      });

      return finalForm;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[] | undefined;
          if (target && target.includes('slug')) {
            throw new BadRequestException(
              `Un formulaire avec le slug "${updateFormDto.slug}" existe déjà. Veuillez choisir un autre slug.`,
            );
          }
        }
      }
      throw error;
    }
  }

  async getAnalytics(id: string, organizationId: string, days: number = 7) {
    console.log(`[FormsService.getAnalytics] Looking for form ${id} in organization ${organizationId}`);
    
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    console.log(`[FormsService.getAnalytics] Form found:`, form ? `${form.name} (org: ${form.organizationId})` : 'NOT FOUND');

    if (!form) {
      throw new NotFoundException(`Formulaire avec l'ID ${id} n'existe pas`);
    }

    // Vérifier si le formulaire appartient à l'organisation
    if (form.organizationId !== organizationId) {
      console.log(`[FormsService.getAnalytics] Organization mismatch: form org ${form.organizationId} !== user org ${organizationId}`);
      throw new NotFoundException(
        `Formulaire avec l'ID ${id} n'appartient pas à l'organisation ${organizationId}. Il appartient à ${form.organizationId}`,
      );
    }

    console.log(`[FormsService.getAnalytics] Success: calculating analytics for form ${form.name}`);
    return this.calculateAnalytics(form, id, days);
  }

  async getAnalyticsForAdmin(id: string, days: number = 7) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Formulaire non trouvé');
    }

    return this.calculateAnalytics(form, id, days);
  }

  private async calculateAnalytics(form: any, id: string, days: number) {

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Compter les vues (approximation via submissions + abandons)
    const [submissions, abandons, leads] = await Promise.all([
      this.prisma.formSubmission.count({
        where: {
          formId: id,
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.formAbandon.count({
        where: {
          formId: id,
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.lead.count({
        where: {
          formId: id,
          createdAt: { gte: startDate },
        },
      }),
    ]);

    const views = submissions + abandons; // Approximation
    const started = submissions + abandons;
    const completed = submissions;
    const abandoned = abandons;

    // Taux de complétion et d'abandon
    const completionRate = started > 0 ? Math.round((completed / started) * 100 * 10) / 10 : 0;
    const abandonmentRate = started > 0 ? Math.round((abandoned / started) * 100 * 10) / 10 : 0;

    // Qualification
    const qualifiedLeads = await this.prisma.lead.count({
      where: {
        formId: id,
        status: 'QUALIFIED',
        createdAt: { gte: startDate },
      },
    });

    const disqualifiedLeads = await this.prisma.lead.count({
      where: {
        formId: id,
        status: 'DISQUALIFIED',
        createdAt: { gte: startDate },
      },
    });

    const totalQualified = qualifiedLeads + disqualifiedLeads;
    const qualificationRate = totalQualified > 0 ? Math.round((qualifiedLeads / totalQualified) * 100 * 10) / 10 : 0;

    // Temps moyen de remplissage (approximation basée sur les timestamps)
    const submissionsWithTime = await this.prisma.formSubmission.findMany({
      where: {
        formId: id,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculer le temps moyen (simplifié)
    let avgTimeSeconds = 154; // Valeur par défaut (2 min 34 sec)
    if (submissionsWithTime.length > 1) {
      const timeDiffs: number[] = [];
      for (let i = 1; i < submissionsWithTime.length; i++) {
        const diff = (submissionsWithTime[i].createdAt.getTime() - submissionsWithTime[i - 1].createdAt.getTime()) / 1000;
        if (diff > 0 && diff < 3600) { // Entre 0 et 1h
          timeDiffs.push(diff);
        }
      }
      if (timeDiffs.length > 0) {
        avgTimeSeconds = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      }
    }

    const avgMinutes = Math.floor(avgTimeSeconds / 60);
    const avgSeconds = Math.round(avgTimeSeconds % 60);

    // Champs posant problème (champs avec le plus d'abandons)
    const abandonsWithData = await this.prisma.formAbandon.findMany({
      where: {
        formId: id,
        createdAt: { gte: startDate },
        dataJson: { not: null },
      },
      select: {
        dataJson: true,
        completionPercentage: true,
      },
    });

    // Analyser les champs problématiques
    const fieldAbandonCounts: Record<string, number> = {};
    abandonsWithData.forEach((abandon) => {
      if (abandon.completionPercentage !== null && abandon.completionPercentage < 100) {
        // Identifier le dernier champ rempli (approximation)
        const lastFieldIndex = Math.floor((abandon.completionPercentage / 100) * form.formFields.length);
        if (lastFieldIndex < form.formFields.length) {
          const fieldLabel = form.formFields[lastFieldIndex]?.label || 'Unknown';
          fieldAbandonCounts[fieldLabel] = (fieldAbandonCounts[fieldLabel] || 0) + 1;
        }
      }
    });

    const problematicFields = Object.entries(fieldAbandonCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([label, count]) => ({
        label,
        abandonCount: count,
        abandonPercentage: abandonsWithData.length > 0 ? Math.round((count / abandonsWithData.length) * 100 * 10) / 10 : 0,
      }));

    // Comparaison avec la période précédente
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const [prevSubmissions, prevAbandons] = await Promise.all([
      this.prisma.formSubmission.count({
        where: {
          formId: id,
          createdAt: { gte: previousStartDate, lt: startDate },
        },
      }),
      this.prisma.formAbandon.count({
        where: {
          formId: id,
          createdAt: { gte: previousStartDate, lt: startDate },
        },
      }),
    ]);

    const prevStarted = prevSubmissions + prevAbandons;
    const prevCompleted = prevSubmissions;
    const prevCompletionRate = prevStarted > 0 ? (prevCompleted / prevStarted) * 100 : 0;
    const prevAbandonmentRate = prevStarted > 0 ? (prevAbandons / prevStarted) * 100 : 0;

    const completionRateChange = completionRate - prevCompletionRate;
    const abandonmentRateChange = abandonmentRate - prevAbandonmentRate;

    return {
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
      metrics: {
        views,
        started,
        completed,
        abandoned,
        completionRate,
        abandonmentRate,
        completionRateChange: Math.round(completionRateChange * 10) / 10,
        abandonmentRateChange: Math.round(abandonmentRateChange * 10) / 10,
      },
      qualification: {
        qualified: qualifiedLeads,
        disqualified: disqualifiedLeads,
        total: totalQualified,
        qualificationRate,
      },
      averageCompletionTime: {
        minutes: avgMinutes,
        seconds: avgSeconds,
        totalSeconds: Math.round(avgTimeSeconds),
      },
      problematicFields,
    };
  }

  /**
   * Évalue un formulaire public (pour preview/validation)
   * Retourne les états effectifs des champs conditionnels et la validation
   */
  async evaluateForm(slug: string, data: Record<string, any>) {
    const form = await this.findBySlug(slug);

    // TODO: Implémenter l'évaluation des règles conditionnelles
    // Pour l'instant, retourner une structure basique
    const effectiveStates: Record<string, boolean> = {};
    const effectiveStateMap: Record<string, any> = {};
    const effectiveData: Record<string, any> = { ...data };

    // Validation basique des champs requis
    const validation: { valid: boolean; errors: Array<{ field: string; message: string }> } = {
      valid: true,
      errors: [],
    };

    form.formFields.forEach((field) => {
      if (field.required && (!data[field.id] || data[field.id] === '')) {
        validation.valid = false;
        validation.errors.push({
          field: field.id,
          message: `Le champ "${field.label}" est requis`,
        });
      }
    });

    return {
      effectiveStates,
      effectiveStateMap,
      effectiveData,
      validation,
    };
  }

  async remove(id: string, organizationId: string) {
    // Utiliser TenantPrismaService pour garantir l'isolation multi-tenant
    return this.tenantPrisma.form.delete({ where: { id } }, organizationId);
  }
}

