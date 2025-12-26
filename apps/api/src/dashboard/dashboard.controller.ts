import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('ceo')
  getCeoDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getCeoDashboard(user.organizationId);
  }

  @Get('closer')
  getCloserDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getCloserDashboard(user.id, user.organizationId);
  }

  @Get('manager')
  getManagerDashboard(@CurrentUser() user: any) {
    console.log(`[DashboardController] getManagerDashboard - user:`, { id: user.id, organizationId: user.organizationId, role: user.role });
    return this.dashboardService.getManagerDashboard(user.id, user.organizationId);
  }

  @Get('setter')
  getSetterDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getSetterDashboard(user.id, user.organizationId);
  }

  @Get('admin')
  getAdminDashboard(@CurrentUser() user: any) {
    // Vérifier que l'utilisateur est bien SUPER_ADMIN
    if (user.role !== 'SUPER_ADMIN') {
      throw new Error('Accès refusé : Seuls les administrateurs peuvent accéder à ce dashboard');
    }
    return this.dashboardService.getAdminDashboard();
  }

  @Get('ceo/trends')
  getCeoTrends(@CurrentUser() user: any) {
    return this.dashboardService.getCeoTrends(user.organizationId);
  }

  @Get('manager/closers-setters-performance')
  getManagerClosersSettersPerformance(@CurrentUser() user: any) {
    return this.dashboardService.getManagerClosersSettersPerformance(user.organizationId);
  }
}


