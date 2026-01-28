import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  Req,
  Logger,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
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
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // accepter leadsVolume, utm_source, etc. sans rejeter
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
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

    // Honeypot anti-spam : si rempli, retourner succès sans écrire en DB
    if (createDto.honeypot?.trim()) {
      return {
        success: true,
        message: 'Inscription réussie',
        alreadyJoined: false,
      };
    }

    // Valider formRenderedAt (timestamp anti-bot ; accepter number ou string)
    const formRenderedAtStr =
      createDto.formRenderedAt != null
        ? typeof createDto.formRenderedAt === 'number'
          ? String(createDto.formRenderedAt)
          : String(createDto.formRenderedAt)
        : undefined;
    try {
      this.securityService.validateSecurity(
        createDto.honeypot,
        formRenderedAtStr,
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

    // Alias front : leadsVolume → leadVolumeRange, utm_source/medium/campaign → camelCase
    const leadVolumeRange = createDto.leadsVolume ?? createDto.leadVolumeRange;
    const utmSource = createDto.utm_source ?? createDto.utmSource;
    const utmMedium = createDto.utm_medium ?? createDto.utmMedium;
    const utmCampaign = createDto.utm_campaign ?? createDto.utmCampaign;

    try {
      const result = await this.waitlistService.createOrGetEntry({
        email: createDto.email,
        name: createDto.name,
        firstName: createDto.firstName,
        role: createDto.role,
        leadVolumeRange,
        teamSize: createDto.teamSize,
        revenue: createDto.revenue,
        utmSource,
        utmMedium,
        utmCampaign,
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
          utmSource,
          utmMedium,
          utmCampaign,
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
      // Logger toutes les erreurs pour le debugging
      this.logger.error(
        `Error creating waitlist entry: ${error?.message || 'Unknown error'}`,
        error?.stack,
        {
          email: createDto.email,
          error: error?.message,
          stack: error?.stack,
          code: error?.code,
        },
      );

      if (error instanceof BadRequestException) {
        this.securityService.logBlockedAttempt(
          error.message,
          requestInfo.ip,
          requestInfo.userAgent,
          undefined,
          { endpoint: 'POST /public/waitlist', email: createDto.email },
        );
        throw error;
      }

      // Contrainte unique (email déjà inscrit) : renvoyer 200 alreadyJoined au lieu de 500
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return {
          success: true,
          message: 'already_joined',
          alreadyJoined: true,
        };
      }

      throw new HttpException(
        'Erreur lors de l\'inscription à la waitlist. Veuillez réessayer plus tard.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
