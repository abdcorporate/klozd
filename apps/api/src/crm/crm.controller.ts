import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateDealDto, UpdateDealDto } from './dto/crm.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post('deals')
  createDeal(@CurrentUser() user: any, @Body() createDealDto: CreateDealDto) {
    return this.crmService.createDeal(user.organizationId, user.id, createDealDto);
  }

  @Get('deals')
  findAllDeals(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.crmService.findAllDeals(
      user.organizationId,
      user.id,
      user.role,
      {},
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get('pipeline')
  getPipeline(@CurrentUser() user: any) {
    return this.crmService.getPipeline(user.organizationId, user.id, user.role);
  }

  @Patch('deals/:id')
  updateDeal(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
  ) {
    return this.crmService.updateDeal(id, user.organizationId, updateDealDto);
  }
}


