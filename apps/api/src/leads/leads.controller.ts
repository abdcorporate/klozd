import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LeadsService } from './leads.service';
import { SubmitFormDto } from './dto/leads.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireOwnership } from '../auth/decorators/require-ownership.decorator';
import { ResourceType } from '../auth/policies/ownership-policy.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto, PaginatedResponse } from '../common/pagination';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IdempotencyService } from '../common/services/idempotency.service';
import { PublicEndpointSecurityService } from '../common/services/public-endpoint-security.service';
import { IpDetectionService } from '../common/services/ip-detection.service';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly prisma: PrismaService,
    private readonly idempotencyService: IdempotencyService,
    private readonly securityService: PublicEndpointSecurityService,
    private readonly ipDetectionService: IpDetectionService,
  ) {}

  @Post('forms/:formId/submit')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async submitForm(
    @Param('formId') formId: string,
    @Body() submitFormDto: SubmitFormDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: any,
  ) {
    // Endpoint public pour soumettre un formulaire
    // Idempotency-Key header is REQUIRED
    const key = this.idempotencyService.validateIdempotencyKey(idempotencyKey);

    // Récupérer l'organizationId depuis le form
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      select: { organizationId: true, slug: true },
    });

    if (!form) {
      throw new NotFoundException('Formulaire non trouvé');
    }

    const requestInfo = this.securityService.extractRequestInfo(req, form.slug);

    // Valider les mesures de sécurité (honeypot + timestamp)
    // Note: SubmitFormDto doit être étendu pour inclure honeypot et formRenderedAt
    const honeypot = (submitFormDto as any).honeypot;
    const formRenderedAt = (submitFormDto as any).formRenderedAt;

    try {
      this.securityService.validateSecurity(honeypot, formRenderedAt);
    } catch (error: any) {
      this.securityService.logBlockedAttempt(
        error.message,
        requestInfo.ip,
        requestInfo.userAgent,
        form.slug,
        { endpoint: 'POST /leads/forms/:formId/submit', formId },
      );
      throw error;
    }

    const scope = `form_submit:${formId}`;

    // Check idempotency
    const stored = await this.idempotencyService.checkIdempotency(
      key,
      scope,
      submitFormDto,
      form.organizationId,
    );

    if (stored) {
      // Return stored response
      this.securityService.logPublicRequest(
        'POST /leads/forms/:formId/submit (idempotent)',
        requestInfo.ip,
        requestInfo.userAgent,
        form.slug,
      );
      return stored.body;
    }

    // Process request
    try {
      const result = await this.leadsService.submitForm(form.organizationId, formId, submitFormDto);

      // Store idempotency record
      await this.idempotencyService.storeResponse(
        key,
        scope,
        submitFormDto,
        HttpStatus.OK,
        result,
        form.organizationId,
      );

      this.securityService.logPublicRequest(
        'POST /leads/forms/:formId/submit',
        requestInfo.ip,
        requestInfo.userAgent,
        form.slug,
        { leadId: result.lead?.id },
      );

      return result;
    } catch (error: any) {
      // Log quota exceeded or other errors
      if (error.status === 429) {
        this.securityService.logBlockedAttempt(
          `Quota exceeded: ${error.message}`,
          requestInfo.ip,
          requestInfo.userAgent,
          form.slug,
          { endpoint: 'POST /leads/forms/:formId/submit', formId, reason: 'quota_exceeded' },
        );
      }
      throw error;
    }
  }

  @Post('forms/:formId/abandon')
  async trackAbandon(
    @Param('formId') formId: string,
    @Body() body: { email?: string; dataJson?: string; completionPercentage?: number },
  ) {
    // Endpoint public pour tracker les abandons de formulaire
    return this.leadsService.trackFormAbandon(formId, body.email, body.dataJson, body.completionPercentage);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer la liste des leads avec pagination par curseur' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre maximum d\'éléments (1-100, défaut: 25)' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Curseur de pagination (base64)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Champ de tri (défaut: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Ordre de tri (défaut: desc)' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Terme de recherche' })
  @ApiResponse({ status: 200, description: 'Liste paginée des leads', type: PaginatedResponse })
  findAll(
    @CurrentUser() user: any,
    @Query() pagination: PaginationQueryDto,
    @Query() filters: any,
  ) {
    // Extraire les filtres de pagination
    const { limit, cursor, sortBy, sortOrder, q, ...otherFilters } = filters;
    const paginationDto: PaginationQueryDto = {
      limit: limit ? Number(limit) : undefined,
      cursor,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
      q,
    };

    return this.leadsService.findAll(
      user.organizationId,
      user.id,
      user.role,
      paginationDto,
      otherFilters,
    );
  }

  // IMPORTANT: Cette route doit être définie AVANT @Get(':id') mais après @Get()
  // Utilisation de 'book/:id' au lieu de 'public/:id' pour éviter les conflits de routage
  @Get('book/:id')
  async getOnePublic(@Param('id') id: string) {
    // Endpoint public pour récupérer un lead (pour la page de réservation)
    return this.leadsService.findOnePublic(id);
  }

  @Post(':id/assign-closer')
  async assignCloser(@Param('id') id: string) {
    // Endpoint public pour attribuer un closer à un lead si nécessaire
    return this.leadsService.assignCloserIfNeeded(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @RequireOwnership(ResourceType.LEAD)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateData: any,
    @Req() req: any,
  ) {
    // Passer les métadonnées de requête pour l'audit log
    const reqMeta = {
      ip: this.ipDetectionService.getClientIp(req),
      userAgent: req.headers['user-agent'],
    };
    return this.leadsService.update(id, user.organizationId, updateData, user.role, user.id, reqMeta);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @RequireOwnership(ResourceType.LEAD)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.findOne(id, user.organizationId);
  }
}

