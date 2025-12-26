import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LivekitService } from './services/livekit.service';
import { JoinCallDto, StartCallDto, StopCallDto } from './dto/calls.dto';
import { CallStatus, UserRole } from '@prisma/client';

@Injectable()
export class CallsService {
  constructor(
    private prisma: PrismaService,
    private livekitService: LivekitService,
  ) {}

  /**
   * Vérifie si un utilisateur peut accéder à un appointment
   */
  async canUserAccessAppointment(
    userId: string,
    userRole: UserRole,
    organizationId: string,
    appointmentId: string,
  ): Promise<boolean> {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
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
      return false;
    }

    // ADMIN : accès à tout
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      return true;
    }

    // MANAGER : appointments des closers/setters de son organisation
    if (userRole === 'MANAGER') {
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
      return userIds.includes(appointment.assignedCloserId);
    }

    // CLOSER : seulement ses appointments
    if (userRole === 'CLOSER') {
      return appointment.assignedCloserId === userId;
    }

    // SETTER : appointments des leads qu'il a qualifiés
    if (userRole === 'SETTER') {
      return appointment.lead.assignedSetterId === userId || !appointment.lead.assignedSetterId;
    }

    return false;
  }

  /**
   * Rejoint un call pour un appointment
   */
  async joinCall(
    appointmentId: string,
    userId: string,
    userRole: UserRole,
    organizationId: string,
    joinCallDto?: JoinCallDto,
  ) {
    // Vérifier l'accès
    const canAccess = await this.canUserAccessAppointment(
      userId,
      userRole,
      organizationId,
      appointmentId,
    );

    if (!canAccess) {
      throw new ForbiddenException('Vous n\'avez pas accès à cet appointment');
    }

    // Récupérer l'appointment
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        lead: {
          organizationId,
        },
      },
      include: {
        lead: true,
        assignedCloser: true,
        call: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment non trouvé');
    }

    // Vérifier que LiveKit est configuré
    if (!this.livekitService.isConfigured()) {
      throw new BadRequestException('Service de visioconférence non configuré');
    }

    // Créer ou récupérer le Call
    let call = appointment.call;

    if (!call) {
      const roomName = this.livekitService.createRoomName(organizationId, appointmentId);

      // Créer la room dans LiveKit (optionnel, peut être créée à la volée)
      try {
        await this.livekitService.createRoom(roomName);
      } catch (error) {
        // Si la room existe déjà, c'est OK
        this.livekitService['logger'].warn(`Room ${roomName} peut-être déjà existante`);
      }

      call = await this.prisma.call.create({
        data: {
          organizationId,
          appointmentId,
          leadId: appointment.leadId,
          roomName,
          status: 'PENDING',
        },
        include: {
          participants: true,
        },
      });
    }

    if (!call) {
      throw new NotFoundException('Impossible de créer ou récupérer le call');
    }

    // Créer ou mettre à jour le participant
    const existingParticipant = await this.prisma.callParticipant.findFirst({
      where: {
        callId: call.id,
        userId,
      },
    });

    if (existingParticipant) {
      // Mettre à jour si rejoin
      await this.prisma.callParticipant.update({
        where: { id: existingParticipant.id },
        data: {
          joinedAt: new Date(),
          leftAt: null,
        },
      });
    } else {
      // Créer nouveau participant
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      await this.prisma.callParticipant.create({
        data: {
          callId: call.id,
          userId,
          role: userRole,
          displayName: joinCallDto?.displayName || `${user?.firstName} ${user?.lastName}`.trim(),
          isHost: userRole === 'ADMIN' || userRole === 'CLOSER',
          isGuest: false,
          joinedAt: new Date(),
        },
      });
    }

    // Générer le token LiveKit
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const metadata = JSON.stringify({
      userId,
      role: userRole,
      organizationId,
      appointmentId,
      callId: call.id,
    });

    const token = this.livekitService.createAccessToken({
      roomName: call.roomName,
      identity: userId,
      metadata,
      name: joinCallDto?.displayName || `${user?.firstName} ${user?.lastName}`.trim(),
    });

    // Mettre à jour le statut du call si c'est le premier participant
    if (call.status === 'PENDING') {
      // Vérifier si l'enregistrement est activé pour cette organisation
      const orgSettings = await this.prisma.organizationSettings.findUnique({
        where: { organizationId },
        select: { callRecordingEnabled: true },
      });

      const shouldRecord = orgSettings?.callRecordingEnabled ?? true;

      // Démarrer l'enregistrement automatiquement si activé
      if (shouldRecord && this.livekitService.isConfigured()) {
        try {
          await this.livekitService.startRecording(call.roomName);
        } catch (error: any) {
          this.livekitService['logger'].warn(`Impossible de démarrer l'enregistrement: ${error.message}`);
        }
      }

      await this.prisma.call.update({
        where: { id: call.id },
        data: {
          status: 'ONGOING',
          startedAt: new Date(),
        },
      });
    }

    return {
      callId: call.id,
      roomName: call.roomName,
      token,
      livekitUrl: this.livekitService.getServerUrl(),
      appointment: {
        id: appointment.id,
        lead: {
          id: appointment.lead.id,
          firstName: appointment.lead.firstName,
          lastName: appointment.lead.lastName,
          email: appointment.lead.email,
        },
        closer: {
          id: appointment.assignedCloser.id,
          firstName: appointment.assignedCloser.firstName,
          lastName: appointment.assignedCloser.lastName,
        },
        scheduledAt: appointment.scheduledAt,
      },
    };
  }

  /**
   * Démarre un call (marque le début officiel)
   */
  async startCall(callId: string, organizationId: string, userId: string, startCallDto?: StartCallDto) {
    const call = await this.prisma.call.findFirst({
      where: {
        id: callId,
        organizationId,
      },
    });

    if (!call) {
      throw new NotFoundException('Call non trouvé');
    }

    // Vérifier si l'enregistrement est activé pour cette organisation
    const orgSettings = await this.prisma.organizationSettings.findUnique({
      where: { organizationId },
      select: { callRecordingEnabled: true },
    });

    const shouldRecord = startCallDto?.startRecording ?? orgSettings?.callRecordingEnabled ?? true;

    // Démarrer l'enregistrement si activé
    if (shouldRecord && this.livekitService.isConfigured()) {
      try {
        await this.livekitService.startRecording(call.roomName);
      } catch (error: any) {
        this.livekitService['logger'].warn(`Impossible de démarrer l'enregistrement: ${error.message}`);
      }
    }

    return this.prisma.call.update({
      where: { id: callId },
      data: {
        status: 'ONGOING',
        startedAt: call.startedAt || new Date(),
      },
    });
  }

  /**
   * Arrête un call
   */
  async stopCall(callId: string, organizationId: string, userId: string, stopCallDto?: StopCallDto) {
    const call = await this.prisma.call.findFirst({
      where: {
        id: callId,
        organizationId,
      },
      include: {
        participants: {
          where: {
            userId,
          },
        },
      },
    });

    if (!call) {
      throw new NotFoundException('Call non trouvé');
    }

    // Mettre à jour le participant (leftAt)
    const participant = call.participants[0];
    if (participant) {
      const leftAt = new Date();
      const joinedAt = participant.joinedAt || call.startedAt || new Date();
      const totalSeconds = Math.floor((leftAt.getTime() - joinedAt.getTime()) / 1000);

      await this.prisma.callParticipant.update({
        where: { id: participant.id },
        data: {
          leftAt,
          totalSeconds: participant.totalSeconds
            ? participant.totalSeconds + totalSeconds
            : totalSeconds,
        },
      });
    }

    // Vérifier s'il reste des participants actifs
    const activeParticipants = await this.prisma.callParticipant.count({
      where: {
        callId,
        leftAt: null,
      },
    });

    // Si plus de participants actifs, marquer le call comme terminé
    if (activeParticipants === 0) {
      const endedAt = new Date();
      const startedAt = call.startedAt || call.createdAt;
      const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

      return this.prisma.call.update({
        where: { id: callId },
        data: {
          status: 'COMPLETED',
          endedAt,
          durationSeconds,
        },
      });
    }

    return call;
  }

  /**
   * Récupère les détails d'un call
   */
  async getCall(callId: string, organizationId: string) {
    const call = await this.prisma.call.findFirst({
      where: {
        id: callId,
        organizationId,
      },
      include: {
        appointment: {
          include: {
            lead: true,
            assignedCloser: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!call) {
      throw new NotFoundException('Call non trouvé');
    }

    return call;
  }

  /**
   * Traite un webhook LiveKit (pour les enregistrements)
   */
  async handleLivekitWebhook(payload: any) {
    const { event, room, recording } = payload;

    if (event === 'recording_completed' && recording) {
      // Trouver le call par roomName
      const call = await this.prisma.call.findFirst({
        where: {
          roomName: room.name,
        },
      });

      if (call) {
        await this.prisma.call.update({
          where: { id: call.id },
          data: {
            recordingUrl: recording.url,
            recordingData: recording,
            durationSeconds: recording.duration
              ? Math.floor(recording.duration)
              : call.durationSeconds,
          },
        });

        this.livekitService['logger'].log(`Enregistrement complété pour call ${call.id}`);
      }
    }

    return { success: true };
  }
}

