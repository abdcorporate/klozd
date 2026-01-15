import { SetMetadata } from '@nestjs/common';
import { ResourceType } from '../policies/ownership-policy.service';

export const OWNERSHIP_RESOURCE_KEY = 'ownership_resource';

/**
 * Décorateur pour activer la vérification d'ownership sur un endpoint
 * @param resourceType Type de ressource (LEAD, APPOINTMENT, DEAL)
 */
export const RequireOwnership = (resourceType: ResourceType) =>
  SetMetadata(OWNERSHIP_RESOURCE_KEY, resourceType);
