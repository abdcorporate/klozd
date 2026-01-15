import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, ROLE_PERMISSIONS } from '../permissions/permissions';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { ROLES_KEY } from '../decorators/require-roles.decorator';

const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Vérifier si l'endpoint est public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true; // Endpoint public, pas de vérification de permissions
    }

    // Vérifier les rôles requis (si spécifiés)
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (requiredRoles && requiredRoles.length > 0) {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        throw new ForbiddenException('Utilisateur non authentifié');
      }

      if (!requiredRoles.includes(user.role)) {
        throw new ForbiddenException('Rôle insuffisant');
      }

      return true; // Rôle vérifié, pas besoin de vérifier les permissions
    }

    const requiredPermissions = this.reflector.get<Permission[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // Pas de permissions requises
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Vérifier les permissions
    const userRole = user.role;
    const userPermissions = this.getUserPermissions(userRole);
    
    // Log de débogage détaillé
    this.logger.log(`[RolesGuard] Vérification permissions pour ${userRole}:`, {
      requiredPermissions,
      userPermissions,
      userRole: userRole,
      roleType: typeof userRole,
      userObject: { id: user.id, email: user.email, role: user.role },
      availableRoles: Object.keys(ROLE_PERMISSIONS),
      adminPermissions: ROLE_PERMISSIONS['ADMIN'],
    });
    
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      // Log pour débogage
      const missing = requiredPermissions.filter((p) => !userPermissions.includes(p));
      this.logger.error(`[RolesGuard] Permission refusée pour ${userRole}:`, {
        required: requiredPermissions,
        userHas: userPermissions,
        missing,
        allAdminPermissions: ROLE_PERMISSIONS['ADMIN'],
        userObject: { id: user.id, email: user.email, role: user.role },
      });
      throw new ForbiddenException('Permissions insuffisantes');
    }
    
    this.logger.log(`[RolesGuard] ✅ Permissions OK pour ${userRole}`);

    return true;
  }

  private getUserPermissions(role: string): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }
}

