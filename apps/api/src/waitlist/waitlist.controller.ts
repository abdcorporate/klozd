import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WaitlistService } from './waitlist.service';
import { CreateWaitlistEntryDto } from './dto/waitlist.dto';
import { PublicEndpointSecurityService } from '../common/services/public-endpoint-security.service';
import { IpDetectionService } from '../common/services/ip-detection.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Waitlist')
@Controller('public/waitlist')
@Public() // Endpoint public, pas besoin d'authentification
export class WaitlistController {
  private readonly logger = new Logger(WaitlistController.name);

  constructor(
    private readonly waitlistService: WaitlistService,
    private readonly securityService: PublicEndpointSecurityService,
    private readonly ipDetectionService: IpDetectionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute per IP (plus strict)
  @ApiOperation({ summary: 'Inscription à la waitlist' })
  @ApiResponse({
    status: 200,
    description: 'Inscription réussie ou déjà inscrit',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        alreadyJoined: { type: 'boolean' },
      },
    },
  })
  async createEntry(
    @Body() createDto: CreateWaitlistEntryDto,
    @Req() req: any,
  ) {
    const requestInfo = this.securityService.extractRequestInfo(req);

    // Valider les mesures de sécurité
    try {
      this.securityService.validateSecurity(
        createDto.honeypot,
        createDto.formRenderedAt,
      );
    } catch (error: any) {
      this.securityService.logBlockedAttempt(
        error.message,
        requestInfo.ip,
        requestInfo.userAgent,
        undefined,
        { endpoint: 'POST /public/waitlist', email: createDto.email },
      );
      throw error;
    }

    // Extraire les informations de la requête
    const ip = this.ipDetectionService.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Validation supplémentaire : vérifier que l'email n'est pas déjà dans la base
    // (double-check avant de créer, pour éviter les race conditions)
    try {
      // Créer ou récupérer l'entrée
      const result = await this.waitlistService.createOrGetEntry({
        email: createDto.email,
        name: createDto.name, // Accepté mais non persistant (le modèle Prisma n'a pas ce champ)
        firstName: createDto.firstName,
        role: createDto.role,
        leadVolumeRange: createDto.leadVolumeRange,
        utmSource: createDto.utmSource,
        utmMedium: createDto.utmMedium,
        utmCampaign: createDto.utmCampaign,
        ip,
        userAgent,
      });

      // Logger la requête
      this.securityService.logPublicRequest(
        'POST /public/waitlist',
        requestInfo.ip,
        requestInfo.userAgent,
        undefined,
        {
          email: createDto.email,
          alreadyJoined: result.alreadyJoined,
          utmSource: createDto.utmSource,
          utmMedium: createDto.utmMedium,
          utmCampaign: createDto.utmCampaign,
        },
      );

      if (result.alreadyJoined) {
        return {
          success: true,
          message: 'already_joined',
          alreadyJoined: true,
        };
      }

      return {
        success: true,
        message: 'Inscription réussie',
        alreadyJoined: false,
      };
    } catch (error: any) {
      // Logger les erreurs de validation de sécurité
      if (error instanceof BadRequestException) {
        this.securityService.logBlockedAttempt(
          error.message,
          requestInfo.ip,
          requestInfo.userAgent,
          undefined,
          { endpoint: 'POST /public/waitlist', email: createDto.email },
        );
      }
      throw error;
    }
  }
}
