import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttributionService } from './services/attribution.service';
import { VisioService } from './services/visio.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/scheduling.dto';
import {
  PaginationQueryDto,
  buildOrderBy,
  buildCursorWhere,
  extractCursor,
  PaginatedResponse,
} from '../common/pagination';

@Injectable()
export class SchedulingService {
  constructor(
    private prisma: PrismaService,
    private attributionService: AttributionService,
    private visioService: VisioService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async createAppointment(
    organizationId: string,
    leadId: string,
    createAppointmentDto: CreateAppointmentDto,
  ) {
    // Vérifier que le lead existe
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, organizationId },
    });

    if (!lead) {
      throw new NotFoundException('Lead non trouvé');
    }

    // Vérifier si le lead est blacklisté (2ème no-show)
    if (lead.status === 'DISQUALIFIED' && lead.disqualificationReason?.includes('blacklisté')) {
      throw new BadRequestException(
        'Ce lead a été blacklisté suite à 2 no-shows consécutifs. Il ne peut plus réserver de rendez-vous.',
      );
    }

    // Si pas de closer assigné, en attribuer un
    let closerId = createAppointmentDto.assignedCloserId;
    if (!closerId) {
      const assignedCloser = await this.attributionService.assignLeadToCloser(
        organizationId,
        lead,
      );
      if (!assignedCloser) {
        throw new BadRequestException('Aucun closer disponible');
      }
      closerId = assignedCloser.id;

      // Mettre à jour le lead avec le closer assigné
      await this.prisma.lead.update({
        where: { id: leadId },
        data: { assignedCloserId: closerId },
      });
    }

    // Créer la réunion visio si un provider est spécifié et pas d'URL personnalisée
    let visioUrl = createAppointmentDto.visioUrl;
    let visioMeetingId = createAppointmentDto.visioMeetingId;
    let visioProvider = createAppointmentDto.visioProvider;

    if (visioProvider && visioProvider !== 'CUSTOM' && !visioUrl) {
      try {
        const meeting = await this.visioService.createMeeting(
          visioProvider as 'ZOOM' | 'GOOGLE_MEET',
          `RDV avec ${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.email,
          new Date(createAppointmentDto.scheduledAt),
          createAppointmentDto.duration || 30,
          lead.email,
        );
        visioUrl = meeting.meetingUrl;
        visioMeetingId = meeting.meetingId;
      } catch (error) {
        // Si la création de la réunion échoue, on continue sans visio
        console.error('Erreur lors de la création de la réunion visio:', error);
      }
    }

    // Créer le rendez-vous
    const appointment = await this.prisma.appointment.create({
      data: {
        leadId,
        assignedCloserId: closerId,
        scheduledAt: new Date(createAppointmentDto.scheduledAt),
        duration: createAppointmentDto.duration || 30,
        status: 'SCHEDULED',
        visioUrl,
        visioMeetingId,
        visioProvider,
      },
      include: {
        lead: true,
        assignedCloser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Mettre à jour le statut du lead
    await this.prisma.lead.update({
      where: { id: leadId },
      data: { status: 'APPOINTMENT_SCHEDULED' },
    });

    // Envoyer WhatsApp au closer pour confirmation (si numéro disponible)
    try {
      await this.sendWhatsAppToCloser(appointment.id);
    } catch (error) {
      // Ne pas faire échouer la création du rendez-vous si l'envoi WhatsApp échoue
      console.error('Erreur lors de l\'envoi WhatsApp au closer:', error);
    }

    // La confirmation T+0 sera envoyée automatiquement par le cron job
    // (voir scheduling-tasks.service.ts)

    return appointment;
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
      sortBy = 'scheduledAt',
      sortOrder = 'asc',
      q,
    } = pagination;

    // Construire les filtres selon le rôle
    let where: any = {
      lead: {
        organizationId,
      },
      ...filters,
    };

    // Recherche textuelle (q)
    if (q) {
      where.OR = [
        { lead: { email: { contains: q, mode: 'insensitive' } } },
        { lead: { firstName: { contains: q, mode: 'insensitive' } } },
        { lead: { lastName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // ADMIN : Tous les RDV (pas de filtre supplémentaire)
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      // Pas de filtre supplémentaire
    }
    // Manager : RDV des leads assignés aux closers/setters de son organisation
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

      // Filtrer les RDV : ceux dont le lead est assigné à un closer/setter de l'organisation
      const roleFilter = {
        lead: {
          organizationId,
          OR: [
            { assignedCloserId: { in: userIds } },
            { assignedSetterId: { in: userIds } },
          ],
        },
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
    // Closer : Seulement ses RDV
    else if (userRole === 'CLOSER') {
      where.assignedCloserId = userId;
    }
    // Setter : RDV des leads qu'il a qualifiés
    else if (userRole === 'SETTER') {
      where.lead = {
        organizationId,
        assignedSetterId: userId,
      };
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

    // Ordering - pour appointments, on utilise scheduledAt par défaut
    const defaultOrderBy = sortBy === 'scheduledAt'
      ? { scheduledAt: sortOrder, id: sortOrder }
      : { createdAt: 'desc', id: 'desc' };
    const orderBy = buildOrderBy(sortBy, sortOrder, defaultOrderBy);

    // Fetch one extra item to determine if there's a next page
    const take = limit + 1;
    const data = await this.prisma.appointment.findMany({
      where,
      take,
      include: {
        lead: true,
        assignedCloser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id,
        lead: {
          organizationId,
        },
      },
      include: {
        lead: true,
        assignedCloser: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Rendez-vous non trouvé');
    }

    return appointment;
  }

  async update(id: string, organizationId: string, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id, organizationId);

    // Convertir les strings en enums si nécessaire
    const updateData: any = { ...updateAppointmentDto };
    if (updateData.status && typeof updateData.status === 'string') {
      updateData.status = updateData.status as any;
    }
    if (updateData.scheduledAt && typeof updateData.scheduledAt === 'string') {
      updateData.scheduledAt = new Date(updateData.scheduledAt);
    }

    // Si le closer est modifié, mettre à jour aussi le lead
    if (updateData.assignedCloserId !== undefined) {
      await this.prisma.lead.update({
        where: { id: appointment.leadId },
        data: { assignedCloserId: updateData.assignedCloserId },
      });
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        lead: true,
        assignedCloser: true,
      },
    });
  }

  async markCompleted(id: string, organizationId: string, outcome: string) {
    const appointment = await this.findOne(id, organizationId);

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        outcome,
        completedAt: new Date(),
      },
    });

    // Mettre à jour le statut du lead
    await this.prisma.lead.update({
      where: { id: appointment.leadId },
      data: { status: 'APPOINTMENT_COMPLETED' },
    });


    return updated;
  }

  async markNoShow(id: string, organizationId: string) {
    const appointment = await this.findOne(id, organizationId);

    // Mettre à jour le statut de l'appointment
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'NO_SHOW',
      },
      include: {
        lead: true,
      },
    });

    const lead = updated.lead;

    // Compter les no-shows précédents pour ce lead
    const previousNoShows = await this.prisma.appointment.count({
      where: {
        leadId: lead.id,
        status: 'NO_SHOW',
        id: { not: id }, // Exclure le no-show actuel
      },
    });

    // Réduire le score de priorité (si existe, sinon on le crée via une mise à jour)
    // Pour l'instant, on utilise le closingProbability comme proxy pour le score de priorité
    // ou on peut ajouter un champ priorityScore dans le schéma si nécessaire
    const currentPriority = lead.closingProbability || 50;
    const newPriority = Math.max(0, currentPriority - 10);

    // Si c'est le 2ème no-show, disqualifier et blacklister le lead
    if (previousNoShows >= 1) {
      // 2ème no-show → disqualifier
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: 'DISQUALIFIED',
          disqualifiedAt: new Date(),
          disqualificationReason: '2 no-shows consécutifs - Lead blacklisté',
          closingProbability: newPriority,
          notes: lead.notes
            ? `${lead.notes}\n\n[${new Date().toISOString()}] 2ème no-show détecté - Lead disqualifié et blacklisté`
            : `[${new Date().toISOString()}] 2ème no-show détecté - Lead disqualifié et blacklisté`,
        },
      });
    } else {
      // 1er no-show → mettre à jour le statut et le score
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: 'DISQUALIFIED', // On peut créer un statut NO_SHOW si nécessaire
          closingProbability: newPriority,
          notes: lead.notes
            ? `${lead.notes}\n\n[${new Date().toISOString()}] No-show détecté - Score réduit de -10`
            : `[${new Date().toISOString()}] No-show détecté - Score réduit de -10`,
        },
      });
    }

    // Envoyer l'email J+0 immédiatement
    try {
      await this.notificationsService.sendNoShowRecoveryEmail(updated.id, 0);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email J+0 pour le no-show ${id}:`, error);
    }

    return updated;
  }

  async getAvailability(closerId: string) {
    const closer = await this.prisma.user.findUnique({
      where: { id: closerId },
      include: {
        closerSettings: {
          select: {
            availabilityJson: true,
            maxAppointmentsPerDay: true,
            roundRobinEnabled: true,
            pseudonyme: true,
          },
        },
        assignedAppointments: {
          where: {
            status: {
              in: ['SCHEDULED', 'CONFIRMED'],
            },
            scheduledAt: {
              gte: new Date(),
            },
          },
        },
      },
    });

    if (!closer || closer.role !== 'CLOSER') {
      throw new NotFoundException('Closer non trouvé');
    }

    // Générer les créneaux disponibles pour les 30 prochains jours
    const availableSlots = this.generateAvailableSlots(
      closer.closerSettings,
      closer.assignedAppointments,
    );

    return {
      closer: {
        id: closer.id,
        firstName: closer.firstName,
        lastName: closer.lastName,
        pseudonyme: closer.closerSettings?.pseudonyme || null,
      },
      availableSlots,
      timezone: closer.timezone,
    };
  }

  private generateAvailableSlots(
    settings: any,
    existingAppointments: any[],
  ): string[] {
    const slots: string[] = [];
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 30);

    // Heures de travail par défaut (9h-18h)
    const workHours = { start: 9, end: 18 };
    const slotDuration = 30; // minutes
    const maxAppointmentsPerDay = settings?.maxAppointmentsPerDay || 5;

    // Créer un Set des créneaux déjà pris
    const bookedSlots = new Set(
      existingAppointments.map((apt) => {
        const date = new Date(apt.scheduledAt);
        return `${date.toISOString().split('T')[0]}_${date.getHours()}_${date.getMinutes()}`;
      }),
    );

    // Générer les créneaux pour chaque jour
    for (let date = new Date(now); date <= endDate; date.setDate(date.getDate() + 1)) {
      // Ignorer les weekends (samedi = 6, dimanche = 0)
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const dateStr = date.toISOString().split('T')[0];
      let dayAppointmentCount = 0;

      // Générer les créneaux pour ce jour
      for (let hour = workHours.start; hour < workHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
          if (dayAppointmentCount >= maxAppointmentsPerDay) break;

          const slotKey = `${dateStr}_${hour}_${minute}`;
          if (!bookedSlots.has(slotKey)) {
            const slotDate = new Date(date);
            slotDate.setHours(hour, minute, 0, 0);
            slots.push(slotDate.toISOString());
            dayAppointmentCount++;
          }
        }
        if (dayAppointmentCount >= maxAppointmentsPerDay) break;
      }
    }

    return slots;
  }

  async createPublicAppointment(createAppointmentDto: CreateAppointmentDto) {
    // Vérifier que le lead existe
    const lead = await this.prisma.lead.findUnique({
      where: { id: createAppointmentDto.leadId },
      include: {
        organization: true,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead non trouvé');
    }

    // Vérifier si le lead est blacklisté (2ème no-show)
    if (lead.status === 'DISQUALIFIED' && lead.disqualificationReason?.includes('blacklisté')) {
      throw new BadRequestException(
        'Vous avez été blacklisté suite à 2 absences consécutives. Vous ne pouvez plus réserver de rendez-vous.',
      );
    }

    // Vérifier que le créneau est disponible
    const closer = await this.prisma.user.findUnique({
      where: { id: createAppointmentDto.assignedCloserId! },
      include: {
        assignedAppointments: {
          where: {
            scheduledAt: new Date(createAppointmentDto.scheduledAt),
            status: {
              in: ['SCHEDULED', 'CONFIRMED'],
            },
          },
        },
      },
    });

    if (!closer) {
      throw new NotFoundException('Closer non trouvé');
    }

    // Vérifier si le créneau est déjà pris
    const slotTime = new Date(createAppointmentDto.scheduledAt);
    const conflictingAppointment = closer.assignedAppointments.find((apt) => {
      const aptTime = new Date(apt.scheduledAt);
      return (
        aptTime.getHours() === slotTime.getHours() &&
        aptTime.getMinutes() === slotTime.getMinutes()
      );
    });

    if (conflictingAppointment) {
      throw new BadRequestException('Ce créneau est déjà réservé');
    }

    // Créer le rendez-vous
    const appointment = await this.createAppointment(lead.organizationId, createAppointmentDto.leadId, {
      ...createAppointmentDto,
      assignedCloserId: createAppointmentDto.assignedCloserId!,
    });

    return appointment;
  }

  /**
   * Envoie un message WhatsApp au closer pour confirmer qu'un prospect a réservé un rendez-vous
   */
  async sendWhatsAppToCloser(appointmentId: string): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        lead: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        assignedCloser: {
          include: {
            closerSettings: {
              select: {
                pseudonyme: true,
              },
            },
          },
        },
      },
    });

    if (!appointment || !appointment.assignedCloser) {
      return;
    }

    const closer = appointment.assignedCloser;
    const lead = appointment.lead;

    // Vérifier que le closer a un numéro de téléphone
    if (!closer.phone) {
      return;
    }

    // Formater la date et l'heure
    const appointmentDate = new Date(appointment.scheduledAt);
    const dateStr = appointmentDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timeStr = appointmentDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Construire le message
    const leadName = lead.firstName || lead.email || 'Un prospect';
    const message = `✅ Nouveau RDV confirmé !\n\n👤 Prospect : ${leadName}${lead.phone ? `\n📞 Tél : ${lead.phone}` : ''}\n📅 Date : ${dateStr}\n⏰ Heure : ${timeStr}\n\nBonne chance ! 🚀`;

    // Envoyer le message WhatsApp
    await this.notificationsService.sendWhatsAppMessage(closer.phone, message);
  }
}

