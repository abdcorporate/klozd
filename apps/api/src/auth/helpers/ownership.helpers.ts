import { OwnershipPolicyService, ResourceType } from '../policies/ownership-policy.service';

/**
 * Helper pour vérifier l'accès à un lead dans un service
 */
export async function checkLeadAccess(
  ownershipPolicyService: OwnershipPolicyService,
  userId: string,
  userRole: string,
  organizationId: string,
  leadId: string,
): Promise<void> {
  await ownershipPolicyService.checkAccess(
    ResourceType.LEAD,
    userId,
    userRole,
    organizationId,
    leadId,
  );
}

/**
 * Helper pour vérifier l'accès à un appointment dans un service
 */
export async function checkAppointmentAccess(
  ownershipPolicyService: OwnershipPolicyService,
  userId: string,
  userRole: string,
  organizationId: string,
  appointmentId: string,
): Promise<void> {
  await ownershipPolicyService.checkAccess(
    ResourceType.APPOINTMENT,
    userId,
    userRole,
    organizationId,
    appointmentId,
  );
}

/**
 * Helper pour vérifier l'accès à un deal dans un service
 */
export async function checkDealAccess(
  ownershipPolicyService: OwnershipPolicyService,
  userId: string,
  userRole: string,
  organizationId: string,
  dealId: string,
): Promise<void> {
  await ownershipPolicyService.checkAccess(
    ResourceType.DEAL,
    userId,
    userRole,
    organizationId,
    dealId,
  );
}
