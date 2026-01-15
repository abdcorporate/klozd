import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FormsService } from './forms.service';
import { CreateFormDto, UpdateFormDto } from './dto/forms.dto';
import { EvaluateFormDto } from './dto/forms-public.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationQueryDto, PaginatedResponse } from '../common/pagination';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PublicEndpointSecurityService } from '../common/services/public-endpoint-security.service';
import { IpDetectionService } from '../common/services/ip-detection.service';

@ApiTags('Forms')
@Controller('forms')
export class FormsController {
  constructor(
    private readonly formsService: FormsService,
    private readonly securityService: PublicEndpointSecurityService,
    private readonly ipDetectionService: IpDetectionService,
  ) {}

  // Endpoint public pour récupérer un formulaire par slug (sans authentification)
  @Get('public/:slug')
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute
  async findBySlug(@Param('slug') slug: string, @Req() req: any) {
    const requestInfo = this.securityService.extractRequestInfo(req, slug);
    this.securityService.logPublicRequest('GET /forms/public/:slug', requestInfo.ip, requestInfo.userAgent, slug);
    return this.formsService.findBySlug(slug);
  }

  // Endpoint public pour évaluer un formulaire (preview/validation)
  @Post('public/:slug/evaluate')
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute
  async evaluateForm(
    @Param('slug') slug: string,
    @Body() evaluateFormDto: EvaluateFormDto,
    @Req() req: any,
  ) {
    const requestInfo = this.securityService.extractRequestInfo(req, slug);

    // Valider les mesures de sécurité
    try {
      this.securityService.validateSecurity(evaluateFormDto.honeypot, evaluateFormDto.formRenderedAt);
    } catch (error: any) {
      this.securityService.logBlockedAttempt(
        error.message,
        requestInfo.ip,
        requestInfo.userAgent,
        slug,
        { endpoint: 'POST /forms/public/:slug/evaluate' },
      );
      throw error;
    }

    this.securityService.logPublicRequest(
      'POST /forms/public/:slug/evaluate',
      requestInfo.ip,
      requestInfo.userAgent,
      slug,
    );

    return this.formsService.evaluateForm(slug, evaluateFormDto.data);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() createFormDto: CreateFormDto) {
    if (!user || !user.organizationId) {
      throw new UnauthorizedException('Utilisateur non authentifié ou organisation manquante');
    }
    return this.formsService.create(user.organizationId, createFormDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer la liste des formulaires avec pagination par curseur' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre maximum d\'éléments (1-100, défaut: 25)' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Curseur de pagination (base64)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Champ de tri (défaut: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Ordre de tri (défaut: desc)' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Terme de recherche' })
  @ApiResponse({ status: 200, description: 'Liste paginée des formulaires', type: PaginatedResponse })
  findAll(
    @CurrentUser() user: any,
    @Query() pagination: PaginationQueryDto,
  ) {
    if (!user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    // Extraire les filtres de pagination
    const { limit, cursor, sortBy, sortOrder, q } = pagination;
    const paginationDto: PaginationQueryDto = {
      limit: limit ? Number(limit) : undefined,
      cursor,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
      q,
    };

    // SUPER_ADMIN peut voir tous les formulaires (toutes les organisations)
    if (user.role === 'SUPER_ADMIN') {
      return this.formsService.findAllForAdmin(paginationDto);
    }
    // Les autres rôles doivent avoir une organisation
    if (!user.organizationId) {
      throw new UnauthorizedException('Organisation manquante');
    }
    return this.formsService.findAll(user.organizationId, paginationDto);
  }

  // IMPORTANT: Les routes plus spécifiques DOIVENT être définies AVANT les routes génériques
  // Sinon NestJS peut matcher la route générique ':id' au lieu de ':id/analytics'
  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard)
  getAnalytics(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('days') days?: string,
  ) {
    console.log(`[FormsController.getAnalytics] Called with id: ${id}, user: ${user?.email}, role: ${user?.role}, orgId: ${user?.organizationId}`);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    const daysNumber = days ? parseInt(days, 10) : 7;
    // SUPER_ADMIN peut voir les analytics de tous les formulaires
    if (user.role === 'SUPER_ADMIN') {
      return this.formsService.getAnalyticsForAdmin(id, daysNumber);
    }
    // Les autres rôles doivent avoir une organisation
    if (!user.organizationId) {
      throw new UnauthorizedException(
        `Organisation manquante pour l'utilisateur ${user.id} (${user.email}) avec le rôle ${user.role}. Veuillez contacter l'administrateur.`,
      );
    }
    return this.formsService.getAnalytics(id, user.organizationId, daysNumber);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    console.log(`[FormsController.findOne] Called with id: ${id}, user: ${user?.email}, role: ${user?.role}, orgId: ${user?.organizationId}`);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    // SUPER_ADMIN peut voir tous les formulaires
    if (user.role === 'SUPER_ADMIN') {
      return this.formsService.findOneForAdmin(id);
    }
    // Les autres rôles doivent avoir une organisation
    if (!user.organizationId) {
      throw new UnauthorizedException('Organisation manquante');
    }
    return this.formsService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
    @Req() req: any,
  ) {
    if (!user || !user.organizationId) {
      throw new UnauthorizedException('Utilisateur non authentifié ou organisation manquante');
    }
    const reqMeta = {
      ip: this.ipDetectionService.getClientIp(req),
      userAgent: req.headers['user-agent'],
    };
    return this.formsService.update(id, user.organizationId, updateFormDto, user.id, reqMeta);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    if (!user || !user.organizationId) {
      throw new UnauthorizedException('Utilisateur non authentifié ou organisation manquante');
    }
    return this.formsService.remove(id, user.organizationId);
  }
}


