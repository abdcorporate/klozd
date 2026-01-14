import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitFormDto } from './dto/leads.dto';
import { ScoringService } from './services/scoring.service';
import { PricingService } from '../settings/pricing.service';
import { AttributionService } from '../scheduling/services/attribution.service';
import {
  PaginationQueryDto,
  buildOrderBy,
  buildCursorWhere,
  extractCursor,
  PaginatedResponse,
} from '../common/pagination';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private scoringService: ScoringService,
    private pricingService: PricingService,
    @Inject(forwardRef(() => AttributionService))
    private attributionService: AttributionService,
  ) {}

  async submitForm(organizationId: string, formId: string, submitFormDto: SubmitFormDto) {
    // 0. Vérifier le quota de leads mensuel
    const settings = await this.prisma.organizationSettings.findUnique({
      where: { organizationId },
    });

    if (settings) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const currentLeadsCount = await this.prisma.lead.count({
        where: {
          organizationId,
          createdAt: { gte: startOfMonth },
        },
      });

      if (currentLeadsCount >= settings.maxLeadsPerMonth) {
        throw new ForbiddenException(
          `Quota de leads mensuel atteint (${settings.maxLeadsPerMonth}). Veuillez passer à un plan supérieur.`,
        );
      }
    }

    // 1. Récupérer le formulaire
    const form = await this.prisma.form.findFirst({
      where: {
        id: formId,
        organizationId,
        status: 'ACTIVE',
      },
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Formulaire non trouvé ou inactif');
    }

    // 2. Calculer le score de qualification
    const score = this.scoringService.calculateScore(form, submitFormDto.data);
    const qualified = score >= form.minScore;

    // 3. Extraire les infos du lead (budget, secteur, urgence)
    const leadInfo = this.scoringService.extractLeadInfo(form, submitFormDto.data);

    // 4. Vérifier si un lead existe déjà avec cet email
    let lead = await this.prisma.lead.findFirst({
      where: {
        email: submitFormDto.email,
        organizationId,
      },
    });

    // 5. Créer ou mettre à jour le lead
    const leadData = {
      email: submitFormDto.email,
      firstName: submitFormDto.firstName,
      lastName: submitFormDto.lastName,
      phone: submitFormDto.phone,
      company: submitFormDto.company,
      formId: form.id,
      qualificationScore: score,
      budget: leadInfo.budget,
      sector: leadInfo.sector,
      urgency: leadInfo.urgency,
      status: (qualified ? 'QUALIFIED' : 'DISQUALIFIED') as 'QUALIFIED' | 'DISQUALIFIED',
      qualifiedAt: qualified ? new Date() : null,
      disqualifiedAt: !qualified ? new Date() : null,
      disqualificationReason: !qualified ? `Score insuffisant (${score}/${form.minScore})` : null,
      source: 'FORM' as const,
    };

    if (lead) {
      // Mettre à jour le lead existant
      lead = await this.prisma.lead.update({
        where: { id: lead.id },
        data: leadData,
      });
    } else {
      // Créer un nouveau lead
      lead = await this.prisma.lead.create({
        data: {
          ...leadData,
          organizationId,
        },
      });
    }

    // 6. Créer la soumission
    const submission = await this.prisma.formSubmission.create({
      data: {
        formId: form.id,
        leadId: lead.id,
        dataJson: JSON.stringify(submitFormDto.data),
        score,
        qualified,
      },
    });

    // 7. Si qualifié, attribuer à un closer (via service d'attribution)
    if (qualified && !lead.assignedCloserId) {
      try {
        const assignedCloser = await this.attributionService.assignLeadToCloser(
          organizationId,
          lead,
        );
        
        if (assignedCloser) {
          // Mettre à jour le lead avec le closer assigné
          lead = await this.prisma.lead.update({
            where: { id: lead.id },
            data: { assignedCloserId: assignedCloser.id },
          });
        }
      } catch (error) {
        console.error('Erreur lors de l\'attribution du closer:', error);
        // Continuer même si l'attribution échoue
      }
    }

    // 8. Vérifier et récupérer les abandons correspondants
    if (submitFormDto.email) {
      await this.prisma.formAbandon.updateMany({
        where: {
          formId: form.id,
          email: submitFormDto.email,
          recovered: false,
        },
        data: {
          recovered: true,
          recoveredAt: new Date(),
          leadId: lead.id,
        },
      });
    }


    // 10. Retourner le résultat avec redirection
    return {
      success: true,
      qualified,
      score,
      lead: {
        id: lead.id,
        status: lead.status,
      },
      redirectUrl: qualified ? form.qualifiedRedirectUrl : form.disqualifiedRedirectUrl,
      message: qualified
        ? 'Votre demande a été qualifiée ! Réservez votre appel maintenant.'
        : form.disqualificationMessage || 'Merci pour votre intérêt. Nous vous contacterons prochainement.',
    };
  }

  async findAll(
    organizationId: string,
    userId: string,
    userRole: string,
    pagination: PaginationQueryDto,
    filters?: any,
  ): Promise<PaginatedResponse<any>> {
    const {
      limit = 25,
      cursor,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      q,
    } = pagination;

    // Construire les filtres selon le rôle
    let where: any = {
      organizationId,
      ...filters,
    };

    // Recherche textuelle (q)
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    // ADMIN : Tous les leads (pas de filtre supplémentaire)
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      // Pas de filtre supplémentaire
    }
    // Manager : Leads assignés aux closers/setters de son organisation
    else if (userRole === 'MANAGER') {
      // Récupérer tous les closers et setters de l'organisation
      const closersAndSetters = await this.prisma.user.findMany({
        where: {
          organizationId,
          role: {
            in: ['CLOSER', 'SETTER'],
          },
        },
        select: {
          id: true,
        },
      });

      const userIds = closersAndSetters.map((u) => u.id);

      // Filtrer les leads : soit assignés à un closer/setter de l'organisation, soit non assignés
      const roleFilter = {
        OR: [
          { assignedCloserId: { in: userIds } },
          { assignedSetterId: { in: userIds } },
          { assignedCloserId: null }, // Leads non assignés
        ],
      };

      // Combiner avec le filtre de recherche si présent
      if (where.OR) {
        where = {
          AND: [
            { OR: where.OR },
            roleFilter,
          ],
        };
      } else {
        where = { ...where, ...roleFilter };
      }
    }
    // Closer : Seulement ses leads assignés
    else if (userRole === 'CLOSER') {
      where.assignedCloserId = userId;
    }
    // Setter : Leads assignés à lui ou non assignés
    else if (userRole === 'SETTER') {
      const setterFilter = {
        OR: [
          { assignedSetterId: userId },
          { assignedSetterId: null }, // Leads non assignés qu'il peut qualifier
        ],
      };

      // Combiner avec le filtre de recherche si présent
      if (where.OR) {
        where = {
          AND: [
            { OR: where.OR },
            setterFilter,
          ],
        };
      } else {
        where = { ...where, ...setterFilter };
      }
    }
    else {
      where.id = 'none'; // Aucun résultat
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
    const data = await this.prisma.lead.findMany({
      where,
      take,
      include: {
        assignedCloser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedSetter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        form: {
          select: {
            id: true,
            name: true,
          },
        },
        aiPrediction: true,
        _count: {
          select: {
            appointments: true,
            deals: true,
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

  async findOnePublic(id: string) {
    // Version publique de findOne, sans vérification d'organisation
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        assignedCloser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        form: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead non trouvé');
    }

    return lead;
  }

  async findOne(id: string, organizationId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, organizationId },
      include: {
        assignedCloser: true,
        form: true,
        submissions: true,
        appointments: {
          orderBy: { scheduledAt: 'desc' },
        },
        deals: {
          orderBy: { createdAt: 'desc' },
        },
        aiPrediction: true,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead non trouvé');
    }

    return lead;
  }

  async trackFormAbandon(formId: string, email?: string, dataJson?: string, completionPercentage?: number) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Formulaire non trouvé');
    }

    // Calculer le pourcentage de complétion si non fourni
    let calculatedPercentage = completionPercentage;
    if (calculatedPercentage === undefined && dataJson) {
      try {
        const data = JSON.parse(dataJson);
        const totalFields = form.formFields.length;
        const filledFields = Object.keys(data).filter(key => {
          const value = data[key];
          return value !== null && value !== undefined && value !== '';
        }).length;
        calculatedPercentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
      } catch {
        calculatedPercentage = 0;
      }
    }

    // Extraire le téléphone des données si l'email n'est pas fourni
    let phone: string | null = null;
    if (!email && dataJson) {
      try {
        const data = JSON.parse(dataJson);
        // Chercher le téléphone dans les données
        phone = data.phone || data.telephone || data.tel || null;
      } catch {
        // Ignorer les erreurs de parsing
      }
    }

    // Vérifier si un abandon existe déjà pour cet email ou ce téléphone
    const existingAbandon = email
      ? await this.prisma.formAbandon.findFirst({
          where: {
            formId,
            email,
            recovered: false,
          },
        })
      : phone
        ? await this.prisma.formAbandon.findFirst({
            where: {
              formId,
              email: null,
              dataJson: {
                contains: phone,
              },
              recovered: false,
            },
          })
        : null;

    if (existingAbandon) {
      // Mettre à jour l'abandon existant
      return this.prisma.formAbandon.update({
        where: { id: existingAbandon.id },
        data: {
          dataJson,
          completionPercentage: calculatedPercentage || 0,
          updatedAt: new Date(),
        },
      });
    }

    // Créer un nouvel abandon et un lead "Abandon"
    const abandon = await this.prisma.formAbandon.create({
      data: {
        formId,
        email: email || null,
        dataJson: dataJson || null,
        completionPercentage: calculatedPercentage || 0,
      },
    });

    // Créer automatiquement un lead "Abandon" si email OU téléphone fourni
    if ((email || phone) && form.organizationId) {
      try {
        const abandonData = dataJson ? JSON.parse(dataJson) : {};
        
        // Utiliser l'email si disponible, sinon générer un email temporaire basé sur le téléphone
        const leadEmail = email || `abandon-${phone?.replace(/\D/g, '')}@temp.klozd.app`;
        
        await this.prisma.lead.create({
          data: {
            organizationId: form.organizationId,
            formId: form.id,
            email: leadEmail,
            firstName: abandonData.firstName || abandonData.first_name || null,
            lastName: abandonData.lastName || abandonData.last_name || null,
            phone: phone || abandonData.phone || abandonData.telephone || null,
            company: abandonData.company || abandonData.societe || null,
            status: 'ABANDONED',
            qualificationScore: 0,
            source: 'FORM',
          },
        });
      } catch (error) {
        // Ignorer les erreurs de création de lead (peut déjà exister)
        console.error('Erreur lors de la création du lead abandon:', error);
      }
    }

    return abandon;
  }

  async update(id: string, organizationId: string, updateData: any, userRole?: string, userId?: string) {
    // Vérifier que le lead existe et appartient à l'organisation
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead non trouvé');
    }

    // Vérifier les permissions pour modifier l'assignation du closer
    // Les CLOSER ne peuvent modifier l'assignation que pour les leads qui leur sont assignés
    if (updateData.assignedCloserId !== undefined && userRole === 'CLOSER') {
      if (lead.assignedCloserId !== userId) {
        throw new ForbiddenException('Vous ne pouvez modifier l\'assignation que pour les leads qui vous sont assignés');
      }
    }

    // Préparer les données de mise à jour
    const updateFields: any = {
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      email: updateData.email,
      phone: updateData.phone,
      company: updateData.company,
      budget: updateData.budget,
      sector: updateData.sector,
      urgency: updateData.urgency,
      notes: updateData.notes,
      status: updateData.status,
    };

    // Si assignedCloserId est fourni, l'ajouter aux champs à mettre à jour
    if (updateData.assignedCloserId !== undefined) {
      updateFields.assignedCloserId = updateData.assignedCloserId;
    }

    // Mettre à jour le lead
    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: updateFields,
      include: {
        assignedCloser: true,
        assignedSetter: true,
        form: true,
        submissions: true,
        appointments: {
          include: {
            assignedCloser: true,
          },
        },
        deals: true,
        aiPrediction: true,
      },
    });

    return updatedLead;
  }

  async assignCloserIfNeeded(leadId: string) {
    // Récupérer le lead
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        organization: true,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead non trouvé');
    }

    // Si le lead a déjà un closer assigné, retourner le lead
    if (lead.assignedCloserId) {
      return {
        success: true,
        lead: {
          id: lead.id,
          assignedCloserId: lead.assignedCloserId,
        },
      };
    }

    // Si le lead n'est pas qualifié, ne pas attribuer de closer
    if (lead.status !== 'QUALIFIED') {
      return {
        success: false,
        message: 'Le lead n\'est pas qualifié',
        lead: {
          id: lead.id,
          assignedCloserId: null,
        },
      };
    }

    // Attribuer un closer
    try {
      const assignedCloser = await this.attributionService.assignLeadToCloser(
        lead.organizationId,
        lead,
      );

      if (!assignedCloser) {
        return {
          success: false,
          message: 'Aucun closer disponible',
          lead: {
            id: lead.id,
            assignedCloserId: null,
          },
        };
      }

      // Mettre à jour le lead avec le closer assigné
      const updatedLead = await this.prisma.lead.update({
        where: { id: leadId },
        data: { assignedCloserId: assignedCloser.id },
      });

      return {
        success: true,
        lead: {
          id: updatedLead.id,
          assignedCloserId: updatedLead.assignedCloserId,
        },
      };
    } catch (error) {
      console.error('Erreur lors de l\'attribution du closer:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'attribution du closer',
        lead: {
          id: lead.id,
          assignedCloserId: null,
        },
      };
    }
  }
}

