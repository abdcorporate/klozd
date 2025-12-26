/**
 * Système de permissions par rôle
 */

export enum Permission {
  // Organisation
  MANAGE_ORGANIZATION = 'MANAGE_ORGANIZATION',
  MANAGE_BILLING = 'MANAGE_BILLING',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  SETTINGS_READ = 'settings:read',
  SETTINGS_WRITE = 'settings:write',

  // Utilisateurs
  CREATE_USERS = 'CREATE_USERS',
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_USERS = 'VIEW_USERS',
  VIEW_ALL_USERS = 'VIEW_ALL_USERS',
  ACTIVATE_USER = 'ACTIVATE_USER',
  DEACTIVATE_USER = 'DEACTIVATE_USER',


  // Formulaires
  CREATE_FORMS = 'CREATE_FORMS',
  MANAGE_FORMS = 'MANAGE_FORMS',
  VIEW_ALL_FORMS = 'VIEW_ALL_FORMS',

  // Leads
  VIEW_ALL_LEADS = 'VIEW_ALL_LEADS',
  VIEW_ORGANIZATION_LEADS = 'VIEW_ORGANIZATION_LEADS', // Manager voit les leads des closers/setters
  VIEW_OWN_LEADS = 'VIEW_OWN_LEADS',
  MANAGE_LEADS = 'MANAGE_LEADS',
  REASSIGN_LEADS = 'REASSIGN_LEADS',

  // Pipeline & Deals
  VIEW_ALL_DEALS = 'VIEW_ALL_DEALS',
  VIEW_ORGANIZATION_DEALS = 'VIEW_ORGANIZATION_DEALS', // Manager voit les deals des closers/setters
  VIEW_OWN_DEALS = 'VIEW_OWN_DEALS',
  MANAGE_DEALS = 'MANAGE_DEALS',

  // Planning
  VIEW_ALL_APPOINTMENTS = 'VIEW_ALL_APPOINTMENTS',
  VIEW_ORGANIZATION_APPOINTMENTS = 'VIEW_ORGANIZATION_APPOINTMENTS', // Manager voit les appointments des closers/setters
  VIEW_OWN_APPOINTMENTS = 'VIEW_OWN_APPOINTMENTS',
  MANAGE_APPOINTMENTS = 'MANAGE_APPOINTMENTS',

  // Analytics
  VIEW_ALL_ANALYTICS = 'VIEW_ALL_ANALYTICS',
  VIEW_ORGANIZATION_ANALYTICS = 'VIEW_ORGANIZATION_ANALYTICS', // Manager voit les stats des closers/setters
  VIEW_OWN_ANALYTICS = 'VIEW_OWN_ANALYTICS',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    Permission.MANAGE_ORGANIZATION,
    Permission.MANAGE_BILLING,
    Permission.MANAGE_SETTINGS,
    Permission.SETTINGS_READ,
    Permission.SETTINGS_WRITE,
    Permission.CREATE_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.VIEW_ALL_USERS,
    Permission.CREATE_FORMS,
    Permission.MANAGE_FORMS,
    Permission.VIEW_ALL_FORMS,
    Permission.VIEW_ALL_LEADS,
    Permission.MANAGE_LEADS,
    Permission.REASSIGN_LEADS,
    Permission.VIEW_ALL_DEALS,
    Permission.MANAGE_DEALS,
    Permission.VIEW_ALL_APPOINTMENTS,
    Permission.MANAGE_APPOINTMENTS,
    Permission.VIEW_ALL_ANALYTICS,
  ],

  MANAGER: [
    Permission.CREATE_USERS, // Closers et Setters seulement
    Permission.MANAGE_USERS, // Dans son organisation (modifier/supprimer closers/setters)
    Permission.VIEW_USERS, // Voir les utilisateurs de l'organisation
    Permission.VIEW_ORGANIZATION_LEADS, // Voir les leads des closers/setters
    Permission.MANAGE_LEADS,
    Permission.REASSIGN_LEADS,
    Permission.VIEW_ORGANIZATION_DEALS, // Voir les deals des closers/setters
    Permission.MANAGE_DEALS,
    Permission.VIEW_ORGANIZATION_APPOINTMENTS, // Voir les appointments des closers/setters
    Permission.MANAGE_APPOINTMENTS,
    Permission.VIEW_ORGANIZATION_ANALYTICS, // Voir les stats des closers/setters
  ],

  CLOSER: [
    Permission.VIEW_OWN_LEADS,
    Permission.MANAGE_LEADS, // Ses propres leads
    Permission.VIEW_OWN_DEALS,
    Permission.MANAGE_DEALS, // Ses propres deals
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.MANAGE_APPOINTMENTS, // Ses propres RDV
    Permission.VIEW_OWN_ANALYTICS,
  ],

  SETTER: [
    Permission.VIEW_OWN_LEADS,
    Permission.MANAGE_LEADS, // Qualification simple
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.MANAGE_APPOINTMENTS, // Scheduling pour closers
  ],

  SUPER_ADMIN: [
    // Super Admin - tous les droits (interne KLOZD)
    ...Object.values(Permission),
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function canAccessResource(
  role: string,
  resourceOwnerId: string,
  currentUserId: string,
  organizationId?: string,
): boolean {
  // ADMIN et SUPER_ADMIN voient tout
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return true;
  }

  // Manager voit les ressources des closers/setters de son organisation
  // (sera vérifié au niveau du service avec organizationId)
  if (role === 'MANAGER') {
    return true; // La vérification d'organisation se fait au niveau du service
  }

  // Closer, Setter voient seulement leurs propres ressources
  return resourceOwnerId === currentUserId;
}

/**
 * Vérifie si un utilisateur peut créer un autre utilisateur avec un rôle donné
 */
export function canCreateUserWithRole(currentUserRole: string, targetRole: string): boolean {
  // ADMIN et SUPER_ADMIN peuvent créer tous les rôles sauf SUPER_ADMIN
  if (currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN') {
    return targetRole !== 'SUPER_ADMIN';
  }

  // MANAGER peut créer seulement CLOSER et SETTER
  if (currentUserRole === 'MANAGER') {
    return targetRole === 'CLOSER' || targetRole === 'SETTER';
  }

  // Autres rôles ne peuvent pas créer d'utilisateurs
  return false;
}

