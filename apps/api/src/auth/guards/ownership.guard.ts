import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OwnershipPolicyService, ResourceType } from '../policies/ownership-policy.service';
import { OWNERSHIP_RESOURCE_KEY } from '../decorators/require-ownership.decorator';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private ownershipPolicyService: OwnershipPolicyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Récupérer le type de ressource depuis le décorateur
    const resourceType = this.reflector.get<ResourceType>(
      OWNERSHIP_RESOURCE_KEY,
      context.getHandler(),
    );

    // Si pas de décorateur, pas de vérification d'ownership
    if (!resourceType) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Récupérer l'ID de la ressource depuis les paramètres
    const resourceId = request.params.id || request.params.leadId || request.params.appointmentId || request.params.dealId;

    if (!resourceId) {
      throw new ForbiddenException('ID de ressource manquant');
    }

    // Vérifier l'accès
    await this.ownershipPolicyService.checkAccess(
      resourceType,
      user.id,
      user.role,
      user.organizationId,
      resourceId,
    );

    return true;
  }
}
