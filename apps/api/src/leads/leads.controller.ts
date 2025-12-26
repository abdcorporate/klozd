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
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { SubmitFormDto } from './dto/leads.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('forms/:formId/submit')
  async submitForm(
    @Param('formId') formId: string,
    @Body() submitFormDto: SubmitFormDto,
  ) {
    // Endpoint public pour soumettre un formulaire
    // Récupérer l'organizationId depuis le form
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      select: { organizationId: true },
    });

    if (!form) {
      throw new NotFoundException('Formulaire non trouvé');
    }

    return this.leadsService.submitForm(form.organizationId, formId, submitFormDto);
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
  findAll(
    @CurrentUser() user: any,
    @Query() filters: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leadsService.findAll(
      user.organizationId,
      user.id,
      user.role,
      filters,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
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
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    return this.leadsService.update(id, user.organizationId, updateData, user.role, user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.findOne(id, user.organizationId);
  }
}

