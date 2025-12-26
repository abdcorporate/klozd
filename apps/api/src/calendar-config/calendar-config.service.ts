import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCalendarConfigDto } from './dto/calendar-config.dto';

@Injectable()
export class CalendarConfigService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère la configuration du calendrier pour une organisation
   * Crée une configuration par défaut si elle n'existe pas
   */
  async findOne(organizationId: string) {
    let config = await this.prisma.calendarConfig.findUnique({
      where: { organizationId },
    });

    // Si pas de config, créer une config par défaut
    if (!config) {
      const defaultAvailability = {
        monday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        tuesday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        wednesday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        thursday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
        friday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '16:00' }],
        saturday: [],
        sunday: [],
      };

      config = await this.prisma.calendarConfig.create({
        data: {
          organizationId,
          availabilityJson: JSON.stringify(defaultAvailability),
          assignedClosersJson: JSON.stringify([]),
        },
      });
    }

    return {
      ...config,
      availability: JSON.parse(config.availabilityJson || '{}'),
      assignedClosers: JSON.parse(config.assignedClosersJson || '[]'),
    };
  }

  /**
   * Met à jour la configuration du calendrier
   */
  async update(organizationId: string, updateDto: UpdateCalendarConfigDto) {
    // Vérifier que la config existe, sinon la créer
    const existing = await this.prisma.calendarConfig.findUnique({
      where: { organizationId },
    });

    const updateData: any = {};

    if (updateDto.callDuration !== undefined) {
      updateData.callDuration = updateDto.callDuration;
    }
    if (updateDto.bufferBefore !== undefined) {
      updateData.bufferBefore = updateDto.bufferBefore;
    }
    if (updateDto.bufferAfter !== undefined) {
      updateData.bufferAfter = updateDto.bufferAfter;
    }
    if (updateDto.availabilityJson !== undefined) {
      updateData.availabilityJson = updateDto.availabilityJson;
    }
    if (updateDto.assignedClosersJson !== undefined) {
      updateData.assignedClosersJson = updateDto.assignedClosersJson;
    }
    if (updateDto.attributionMethod !== undefined) {
      updateData.attributionMethod = updateDto.attributionMethod;
    }
    if (updateDto.emailConfirmationImmediate !== undefined) {
      updateData.emailConfirmationImmediate = updateDto.emailConfirmationImmediate;
    }
    if (updateDto.emailReminder24h !== undefined) {
      updateData.emailReminder24h = updateDto.emailReminder24h;
    }
    if (updateDto.emailReminder1h !== undefined) {
      updateData.emailReminder1h = updateDto.emailReminder1h;
    }
    if (updateDto.smsReminder1h !== undefined) {
      updateData.smsReminder1h = updateDto.smsReminder1h;
    }

    const config = existing
      ? await this.prisma.calendarConfig.update({
          where: { organizationId },
          data: updateData,
        })
      : await this.prisma.calendarConfig.create({
          data: {
            organizationId,
            ...updateData,
            // Valeurs par défaut si création
            availabilityJson: updateData.availabilityJson || JSON.stringify({}),
            assignedClosersJson: updateData.assignedClosersJson || JSON.stringify([]),
          },
        });

    return {
      ...config,
      availability: JSON.parse(config.availabilityJson || '{}'),
      assignedClosers: JSON.parse(config.assignedClosersJson || '[]'),
    };
  }
}

