import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';

@Controller('exports')
@UseGuards(JwtAuthGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('leads')
  async exportLeads(
    @CurrentUser() user: any,
    @Res() res: Response,
    @Query() filters: any,
  ) {
    const csv = await this.exportsService.exportLeads(
      user.organizationId,
      user.id,
      user.role as UserRole,
      filters,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
    );
    res.send(csv);
  }

  @Get('deals')
  async exportDeals(
    @CurrentUser() user: any,
    @Res() res: Response,
    @Query() filters: any,
  ) {
    const csv = await this.exportsService.exportDeals(
      user.organizationId,
      user.id,
      user.role as UserRole,
      filters,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="deals-${new Date().toISOString().split('T')[0]}.csv"`,
    );
    res.send(csv);
  }
}

