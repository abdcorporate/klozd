# 🔐 PATCH COMPLET : AUTHORIZATION FINE "OWNERSHIP"

## 📋 RÉSUMÉ

Ce patch implémente une autorisation fine basée sur l'**ownership** en plus du RBAC existant. Il garantit que les utilisateurs CLOSER et SETTER ne peuvent accéder qu'aux ressources qui leur sont assignées.

## 🎯 RÈGLES D'OWNERSHIP IMPLÉMENTÉES

### **SUPER_ADMIN / ADMIN**
- ✅ Accès full org (pas de restriction d'ownership)

### **MANAGER**
- ✅ Accès full org (pas de restriction d'ownership)
- ⚠️ Sauf modifications sensibles users/roles (déjà géré par RBAC)

### **CLOSER**
- **Leads** : Lecture uniquement si `assignedCloserId = user.id` OU si lead non assigné (`assignedCloserId = null`)
- **Appointments** : Lecture uniquement si `assignedCloserId = user.id`
- **Deals** : Lecture uniquement si `createdById = user.id` OU si `lead.assignedCloserId = user.id`

### **SETTER**
- **Leads** : Lecture si `assignedSetterId = user.id` OU si lead non assigné (`assignedSetterId = null`)
- **Deals** : Pas d'accès (ou lecture limitée si déjà prévu)
- **Appointments** : Pas d'accès direct

## 📁 FICHIERS CRÉÉS/MODIFIÉS

### 1. **Nouveau** : `apps/api/src/auth/policies/ownership-policy.service.ts`
- Service centralisé pour vérifier l'ownership
- Méthodes : `canAccessLead`, `canAccessAppointment`, `canAccessDeal`
- Helper générique : `checkAccess`
- Feature flag : `ENABLE_OWNERSHIP_CHECK` (env variable)

### 2. **Nouveau** : `apps/api/src/auth/guards/ownership.guard.ts`
- Guard NestJS pour protéger les endpoints
- Utilise le décorateur `@RequireOwnership()` pour activer la vérification
- Récupère automatiquement l'ID de la ressource depuis les paramètres de route

### 3. **Nouveau** : `apps/api/src/auth/decorators/require-ownership.decorator.ts`
- Décorateur `@RequireOwnership(ResourceType.LEAD | APPOINTMENT | DEAL)`
- Facilite l'activation de l'ownership check sur les endpoints

### 4. **Nouveau** : `apps/api/src/auth/helpers/ownership.helpers.ts`
- Helpers réutilisables pour les services :
  - `checkLeadAccess()`
  - `checkAppointmentAccess()`
  - `checkDealAccess()`

### 5. **Modifié** : `apps/api/src/auth/auth.module.ts`
- Ajout de `OwnershipPolicyService` et `OwnershipGuard` aux providers
- Export de ces services pour utilisation dans d'autres modules

### 6. **Modifié** : `apps/api/src/leads/leads.controller.ts`
- Import de `OwnershipGuard` et `RequireOwnership`
- `GET /leads/:id` : `@RequireOwnership(ResourceType.LEAD)`
- `PATCH /leads/:id` : `@RequireOwnership(ResourceType.LEAD)`

### 7. **Modifié** : `apps/api/src/scheduling/scheduling.controller.ts`
- Import de `OwnershipGuard` et `RequireOwnership`
- `GET /scheduling/appointments/:id` : `@RequireOwnership(ResourceType.APPOINTMENT)`
- `PATCH /scheduling/appointments/:id` : `@RequireOwnership(ResourceType.APPOINTMENT)`
- `POST /scheduling/appointments/:id/complete` : `@RequireOwnership(ResourceType.APPOINTMENT)`
- `POST /scheduling/appointments/:id/no-show` : `@RequireOwnership(ResourceType.APPOINTMENT)`

### 8. **Modifié** : `apps/api/src/crm/crm.controller.ts`
- Import de `OwnershipGuard` et `RequireOwnership`
- `PATCH /crm/deals/:id` : `@RequireOwnership(ResourceType.DEAL)`

### 9. **Modifié** : `apps/api/src/leads/leads.module.ts`
- Import de `AuthModule` pour accéder à `OwnershipGuard`

### 10. **Modifié** : `apps/api/src/scheduling/scheduling.module.ts`
- Import de `AuthModule` pour accéder à `OwnershipGuard`

### 11. **Modifié** : `apps/api/src/crm/crm.module.ts`
- Import de `AuthModule` pour accéder à `OwnershipGuard`

### 12. **Nouveau** : `apps/api/test/integration/ownership-authorization.e2e-spec.ts`
- 4 tests E2E couvrant les scénarios d'ownership :
  1. CLOSER ne peut pas GET lead assigné à un autre CLOSER
  2. CLOSER ne peut pas GET appointment assigné à un autre CLOSER
  3. CLOSER ne peut pas PATCH deal créé par un autre CLOSER
  4. SETTER ne peut pas GET lead assigné à un autre SETTER

## 🔧 FEATURE FLAG

### Activation/Désactivation

**Variable d'environnement** : `ENABLE_OWNERSHIP_CHECK`

```bash
# Activer l'ownership check
ENABLE_OWNERSHIP_CHECK=true

# Désactiver l'ownership check (comportement par défaut)
ENABLE_OWNERSHIP_CHECK=false
# ou simplement ne pas définir la variable
```

**Comportement** :
- Si `ENABLE_OWNERSHIP_CHECK !== 'true'` : L'ownership check est **désactivé** (tous les accès sont autorisés, comme avant)
- Si `ENABLE_OWNERSHIP_CHECK === 'true'` : L'ownership check est **activé** (les règles d'ownership sont appliquées)

**Pour les tests** :
```typescript
// Dans les tests E2E
process.env.ENABLE_OWNERSHIP_CHECK = 'true';
```

## 📊 DÉTAILS DES RÈGLES

### Leads

#### CLOSER
```typescript
// ✅ Autorisé
- lead.assignedCloserId === userId
- lead.assignedCloserId === null (non assigné)

// ❌ Refusé
- lead.assignedCloserId === autreUserId
```

#### SETTER
```typescript
// ✅ Autorisé
- lead.assignedSetterId === userId
- lead.assignedSetterId === null (non assigné)

// ❌ Refusé
- lead.assignedSetterId === autreUserId
```

### Appointments

#### CLOSER
```typescript
// ✅ Autorisé
- appointment.assignedCloserId === userId

// ❌ Refusé
- appointment.assignedCloserId === autreUserId
- appointment.assignedCloserId === null
```

#### SETTER
```typescript
// ❌ Pas d'accès direct aux appointments
```

### Deals

#### CLOSER
```typescript
// ✅ Autorisé
- deal.createdById === userId
- deal.lead.assignedCloserId === userId

// ❌ Refusé
- deal.createdById === autreUserId ET deal.lead.assignedCloserId !== userId
```

#### SETTER
```typescript
// ❌ Pas d'accès aux deals
```

## 🧪 TESTS E2E

### Test 1 : CLOSER ne peut pas accéder au lead d'un autre CLOSER
```typescript
it('should deny closer1 to GET lead assigned to closer2 (lead2)', async () => {
  const response = await request(httpServer)
    .get(`/leads/${lead2.id}`)
    .set('Authorization', `Bearer ${closer1.token}`)
    .expect(403);
});
```

### Test 2 : CLOSER ne peut pas accéder à l'appointment d'un autre CLOSER
```typescript
it('should deny closer1 to GET appointment assigned to closer2 (appointment2)', async () => {
  const response = await request(httpServer)
    .get(`/scheduling/appointments/${appointment2.id}`)
    .set('Authorization', `Bearer ${closer1.token}`)
    .expect(403);
});
```

### Test 3 : CLOSER ne peut pas modifier le deal d'un autre CLOSER
```typescript
it('should deny closer1 to PATCH deal created by closer2 (deal2)', async () => {
  const response = await request(httpServer)
    .patch(`/crm/deals/${deal2.id}`)
    .set('Authorization', `Bearer ${closer1.token}`)
    .send({ title: 'Hacked Deal' })
    .expect(403);
});
```

### Test 4 : SETTER ne peut pas accéder au lead d'un autre SETTER
```typescript
it('should deny setter1 to GET lead assigned to setter2 (lead2)', async () => {
  const response = await request(httpServer)
    .get(`/leads/${lead2.id}`)
    .set('Authorization', `Bearer ${setter1.token}`)
    .expect(403);
});
```

## 🔄 COMPATIBILITÉ

### Pas de Breaking Changes

- ✅ Les endpoints existants fonctionnent sans modification
- ✅ Si `ENABLE_OWNERSHIP_CHECK` n'est pas défini ou = `false`, comportement par défaut (pas de restriction)
- ✅ Les rôles ADMIN, SUPER_ADMIN, MANAGER ne sont pas affectés (accès full org)
- ✅ Les endpoints publics ne sont pas affectés (pas de guard)

### Migration Progressive

1. **Phase 1** : Déployer le code avec `ENABLE_OWNERSHIP_CHECK=false` (par défaut)
2. **Phase 2** : Tester en activant `ENABLE_OWNERSHIP_CHECK=true` sur un environnement de staging
3. **Phase 3** : Activer en production une fois validé

## 📝 UTILISATION

### Dans un Controller

```typescript
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { RequireOwnership } from '../auth/decorators/require-ownership.decorator';
import { ResourceType } from '../auth/policies/ownership-policy.service';

@Get(':id')
@UseGuards(JwtAuthGuard, OwnershipGuard)
@RequireOwnership(ResourceType.LEAD)
findOne(@CurrentUser() user: any, @Param('id') id: string) {
  return this.leadsService.findOne(id, user.organizationId);
}
```

### Dans un Service (avec helper)

```typescript
import { OwnershipPolicyService } from '../auth/policies/ownership-policy.service';
import { checkLeadAccess } from '../auth/helpers/ownership.helpers';

async updateLead(id: string, userId: string, userRole: string, organizationId: string, data: any) {
  // Vérifier l'ownership avant la mise à jour
  await checkLeadAccess(this.ownershipPolicyService, userId, userRole, organizationId, id);
  
  // Continuer avec la mise à jour...
}
```

## ⚠️ POINTS D'ATTENTION

### 1. **Feature Flag**
- L'ownership check est **désactivé par défaut** pour éviter les breaking changes
- Activer explicitement avec `ENABLE_OWNERSHIP_CHECK=true`

### 2. **Endpoints non protégés**
- Les endpoints de liste (`GET /leads`, `GET /appointments`, etc.) ne sont pas protégés par ownership
- La logique de filtrage par ownership est déjà dans les services (`findAll`)

### 3. **Leads non assignés**
- Les CLOSER et SETTER peuvent accéder aux leads non assignés (comportement souhaité pour la qualification)

### 4. **Deals via Lead**
- Un CLOSER peut accéder à un deal si le lead associé lui est assigné, même s'il n'a pas créé le deal

### 5. **Performance**
- Chaque vérification d'ownership fait une requête Prisma
- Pour les endpoints de liste, la logique de filtrage dans les services est plus efficace

## ✅ VALIDATION

- [x] OwnershipPolicyService créé avec feature flag
- [x] OwnershipGuard créé
- [x] Décorateur RequireOwnership créé
- [x] Helpers réutilisables créés
- [x] Controllers mis à jour (Leads, Scheduling, CRM)
- [x] Modules mis à jour (import AuthModule)
- [x] 4 tests E2E créés
- [x] Pas d'erreurs de lint
- [x] Documentation complète

## 🔄 PROCHAINES ÉTAPES (Optionnel)

1. Ajouter l'ownership check sur les endpoints de liste (si nécessaire)
2. Ajouter des tests unitaires pour `OwnershipPolicyService`
3. Ajouter des métriques/logs pour monitorer les refus d'accès
4. Étendre l'ownership aux autres ressources si nécessaire

---

**Date** : 2025-01-27  
**Auteur** : Implémentation authorization fine ownership  
**Version** : 1.0.0
