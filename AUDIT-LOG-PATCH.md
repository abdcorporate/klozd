# 📋 PATCH COMPLET : AUDIT LOG MINIMAL

## 📋 RÉSUMÉ

Ce patch implémente un système d'audit log minimal pour tracer toutes les mutations critiques dans l'application :
- **Modèle Prisma** : `AuditLog` avec tous les champs requis
- **Service** : `AuditLogService` avec méthode `logChange()` et récupération paginée
- **Intégration** : Sur toutes les mutations critiques (Leads, Forms, Appointments, Users, Settings)
- **Endpoint Admin** : `GET /admin/audit-logs` avec pagination et filtres
- **Tests E2E** : 2 tests pour vérifier la création d'audit logs

## 🎯 BACKEND (apps/api)

### **1. Modèle Prisma : `AuditLog`**

```prisma
model AuditLog {
  id            String    @id @default(cuid())
  organizationId String
  organization  Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  actorUserId   String?  // ID de l'utilisateur qui a effectué l'action (null si système)
  actor         User?    @relation(fields: [actorUserId], references: [id], onDelete: SetNull)
  action        String   // Action effectuée (CREATE, UPDATE, DELETE, ASSIGN, QUALIFY, DISQUALIFY, PUBLISH, etc.)
  entityType    String   // Type d'entité (LEAD, FORM, APPOINTMENT, USER, SETTINGS, etc.)
  entityId      String   // ID de l'entité concernée
  beforeJson    String?  @db.Text // État avant (JSON)
  afterJson     String?  @db.Text // État après (JSON)
  ip            String?  // Adresse IP
  userAgent     String?  // User-Agent
  createdAt     DateTime  @default(now())

  @@index([organizationId])
  @@index([actorUserId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```

### **2. Service : `AuditLogService`**

**Méthodes principales** :
- `logChange(params)` : Enregistre un changement dans l'audit log
  - Sanitize automatique des données sensibles (password, token, secret, etc.)
  - Ne fait pas échouer l'opération principale si l'audit log échoue
- `getAuditLogs(organizationId, filters?, pagination?)` : Récupère les logs avec pagination cursor
  - Filtres : `entityType`, `entityId`, `action`, `actorUserId`, `startDate`, `endDate`
  - Pagination : `limit`, `cursor`, `sortBy`, `sortOrder`

### **3. Intégration dans les Services**

#### **LeadsService**
- **`update()`** : Audit log sur UPDATE, QUALIFY, DISQUALIFY, ASSIGN
  - Détecte automatiquement l'action selon les changements
  - Enregistre `before` et `after` avec les champs critiques
- **`assignCloserIfNeeded()`** : Audit log sur ASSIGN (système, actor = null)

#### **FormsService**
- **`update()`** : Audit log sur UPDATE, PUBLISH, STATUS_CHANGE
  - Détecte automatiquement PUBLISH si status passe à ACTIVE
  - Enregistre les changements de statut et de champs

#### **SchedulingService**
- **`createAppointment()`** : Audit log sur CREATE
- **`update()`** : Audit log sur UPDATE, CANCEL
- **`markNoShow()`** : Audit log sur NO_SHOW
- **`markCompleted()`** : Audit log sur COMPLETE

#### **UsersService**
- **`create()`** : Audit log sur CREATE
- **`update()`** : Audit log sur UPDATE, ROLE_CHANGE
- **`activate()`** : Audit log sur ACTIVATE
- **`deactivate()`** : Audit log sur DEACTIVATE

#### **SettingsService**
- **`updateSettings()`** : Audit log sur UPDATE (organization settings)
- **`updateOrganization()`** : Audit log sur UPDATE (organization data)

#### **CalendarConfigService**
- **`update()`** : Audit log sur UPDATE (calendar config)

### **4. Endpoint Admin : `GET /admin/audit-logs`**

**Route** : `GET /admin/audit-logs`

**Guards** : `JwtAuthGuard`, `RolesGuard` avec `@RequireRoles('ADMIN', 'SUPER_ADMIN')`

**Query Parameters** :
- `limit` : Nombre d'éléments (1-100, défaut: 25)
- `cursor` : Curseur de pagination (base64)
- `sortBy` : Champ de tri (défaut: createdAt)
- `sortOrder` : Ordre de tri (asc/desc, défaut: desc)
- `entityType` : Filtrer par type (LEAD, FORM, APPOINTMENT, USER, SETTINGS)
- `entityId` : Filtrer par ID d'entité
- `action` : Filtrer par action (CREATE, UPDATE, ASSIGN, QUALIFY, etc.)
- `actorUserId` : Filtrer par ID de l'acteur

**Réponse** :
```json
{
  "items": [
    {
      "id": "...",
      "organizationId": "...",
      "actorUserId": "...",
      "actor": { "id": "...", "email": "...", "firstName": "...", "lastName": "..." },
      "action": "QUALIFY",
      "entityType": "LEAD",
      "entityId": "...",
      "beforeJson": "{...}",
      "afterJson": "{...}",
      "ip": "...",
      "userAgent": "...",
      "createdAt": "..."
    }
  ],
  "pageInfo": {
    "hasNextPage": true,
    "nextCursor": "..."
  }
}
```

### **5. Décorateur `@RequireRoles`**

Nouveau décorateur créé pour vérifier les rôles directement (sans passer par les permissions) :
```typescript
@RequireRoles('ADMIN', 'SUPER_ADMIN')
```

Le `RolesGuard` a été mis à jour pour supporter ce décorateur.

## 📁 FICHIERS CRÉÉS/MODIFIÉS

### **Backend**

1. **Nouveau** : `apps/api/src/common/services/audit-log.service.ts`
   - Service complet pour gestion des audit logs

2. **Modifié** : `apps/api/prisma/schema.prisma`
   - Ajout table `AuditLog` avec relations

3. **Modifié** : `apps/api/src/common/common.module.ts`
   - Ajout `AuditLogService` dans providers et exports

4. **Modifié** : `apps/api/src/leads/leads.service.ts`
   - Intégration audit log dans `update()` et `assignCloserIfNeeded()`

5. **Modifié** : `apps/api/src/leads/leads.controller.ts`
   - Passage de `reqMeta` (ip, userAgent) à `update()`

6. **Modifié** : `apps/api/src/leads/leads.module.ts`
   - Import `CommonModule` pour `AuditLogService`

7. **Modifié** : `apps/api/src/forms/forms.service.ts`
   - Intégration audit log dans `update()`

8. **Modifié** : `apps/api/src/forms/forms.controller.ts`
   - Passage de `userId` et `reqMeta` à `update()`

9. **Modifié** : `apps/api/src/scheduling/scheduling.service.ts`
   - Intégration audit log dans `createAppointment()`, `update()`, `markNoShow()`, `markCompleted()`

10. **Modifié** : `apps/api/src/scheduling/scheduling.controller.ts`
    - Passage de `userId` et `reqMeta` aux méthodes

11. **Modifié** : `apps/api/src/users/users.service.ts`
    - Intégration audit log dans `create()`, `update()`, `activate()`, `deactivate()`

12. **Modifié** : `apps/api/src/users/users.controller.ts`
    - Passage de `userId` et `reqMeta` aux méthodes
    - Import `Req` depuis `@nestjs/common`

13. **Modifié** : `apps/api/src/users/users.module.ts`
    - Import `CommonModule` pour `AuditLogService`

14. **Modifié** : `apps/api/src/settings/settings.service.ts`
    - Intégration audit log dans `updateSettings()` et `updateOrganization()`

15. **Modifié** : `apps/api/src/settings/settings.controller.ts`
    - Passage de `userId` et `reqMeta` aux méthodes
    - Import `Req` depuis `@nestjs/common`

16. **Modifié** : `apps/api/src/settings/settings.module.ts`
    - Import `CommonModule` pour `AuditLogService`

17. **Modifié** : `apps/api/src/calendar-config/calendar-config.service.ts`
    - Intégration audit log dans `update()`

18. **Modifié** : `apps/api/src/calendar-config/calendar-config.controller.ts`
    - Passage de `userId` et `reqMeta` à `update()`
    - Import `Req` depuis `@nestjs/common`

19. **Modifié** : `apps/api/src/calendar-config/calendar-config.module.ts`
    - Import `CommonModule` pour `AuditLogService`

20. **Nouveau** : `apps/api/src/admin/audit-logs/admin-audit-logs.controller.ts`
    - Endpoint `GET /admin/audit-logs` avec pagination et filtres

21. **Nouveau** : `apps/api/src/admin/audit-logs/admin-audit-logs.module.ts`
    - Module pour l'endpoint admin

22. **Modifié** : `apps/api/src/app.module.ts`
    - Import `AdminAuditLogsModule`

23. **Nouveau** : `apps/api/src/auth/decorators/require-roles.decorator.ts`
    - Décorateur `@RequireRoles()` pour vérifier les rôles

24. **Modifié** : `apps/api/src/auth/guards/roles.guard.ts`
    - Support du décorateur `@RequireRoles()`

25. **Nouveau** : `apps/api/test/integration/audit-log.e2e-spec.ts`
    - Tests E2E pour vérifier la création d'audit logs

## 🧪 TESTS E2E

### **Test 1 : Audit Log sur Lead Update**
```typescript
it('should create an audit log entry when updating a lead', async () => {
  // Update the lead
  const updateResponse = await request(httpServer)
    .patch(`/leads/${lead.id}`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      status: 'QUALIFIED',
      budget: 5000,
    })
    .expect(200);

  // Wait a bit for async audit log
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Check audit log
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      organizationId: organization.id,
      entityType: 'LEAD',
      entityId: lead.id,
    },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });

  expect(auditLogs.length).toBeGreaterThan(0);
  const auditLog = auditLogs[0];

  expect(auditLog.action).toBe('QUALIFY');
  expect(auditLog.entityType).toBe('LEAD');
  expect(auditLog.entityId).toBe(lead.id);
  expect(auditLog.actorUserId).toBe(user.id);
  expect(auditLog.beforeJson).toBeDefined();
  expect(auditLog.afterJson).toBeDefined();

  // Parse JSON
  const before = JSON.parse(auditLog.beforeJson || '{}');
  const after = JSON.parse(auditLog.afterJson || '{}');

  expect(before.status).toBe('NEW');
  expect(after.status).toBe('QUALIFIED');
});
```

### **Test 2 : Audit Log sur Form Update (Publish)**
```typescript
it('should create an audit log entry when updating a form', async () => {
  // Create a form
  const form = await prisma.form.create({
    data: {
      name: 'Test Form Update',
      slug: 'test-form-update-audit',
      status: 'DRAFT',
      organizationId: organization.id,
    },
  });

  // Update the form (publish it)
  const updateResponse = await request(httpServer)
    .patch(`/forms/${form.id}`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      status: 'ACTIVE',
    })
    .expect(200);

  // Wait a bit for async audit log
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Check audit log
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      organizationId: organization.id,
      entityType: 'FORM',
      entityId: form.id,
    },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });

  expect(auditLogs.length).toBeGreaterThan(0);
  const auditLog = auditLogs[0];

  expect(auditLog.action).toBe('PUBLISH');
  expect(auditLog.entityType).toBe('FORM');
  expect(auditLog.entityId).toBe(form.id);
  expect(auditLog.actorUserId).toBe(user.id);

  // Parse JSON
  const before = JSON.parse(auditLog.beforeJson || '{}');
  const after = JSON.parse(auditLog.afterJson || '{}');

  expect(before.status).toBe('DRAFT');
  expect(after.status).toBe('ACTIVE');
});
```

### **Test 3 : Endpoint Admin GET /admin/audit-logs**
```typescript
it('should return paginated audit logs', async () => {
  const response = await request(httpServer)
    .get('/admin/audit-logs')
    .set('Authorization', `Bearer ${user.token}`)
    .expect(200);

  expect(response.body).toHaveProperty('items');
  expect(response.body).toHaveProperty('pageInfo');
  expect(Array.isArray(response.body.items)).toBe(true);
});

it('should filter audit logs by entityType', async () => {
  const response = await request(httpServer)
    .get('/admin/audit-logs')
    .query({ entityType: 'LEAD' })
    .set('Authorization', `Bearer ${user.token}`)
    .expect(200);

  expect(response.body.items.every((log: any) => log.entityType === 'LEAD')).toBe(true);
});
```

## 🚀 DÉPLOIEMENT

### **1. Migration Prisma**

```bash
cd apps/api
pnpm prisma migrate dev --name add_audit_logs
```

### **2. Vérifications**

```bash
# Backend
cd apps/api
pnpm build
pnpm test:e2e:local
```

## 📊 COUVERTURE

### **Mutations Critiques Couvertes**

#### **Leads**
- ✅ `PATCH /leads/:id` : UPDATE, QUALIFY, DISQUALIFY, ASSIGN
- ✅ `POST /leads/:id/assign-closer` : ASSIGN (système)

#### **Forms**
- ✅ `PATCH /forms/:id` : UPDATE, PUBLISH, STATUS_CHANGE

#### **Appointments**
- ✅ `POST /scheduling/appointments` : CREATE
- ✅ `PATCH /scheduling/appointments/:id` : UPDATE, CANCEL
- ✅ `POST /scheduling/appointments/:id/no-show` : NO_SHOW
- ✅ `POST /scheduling/appointments/:id/complete` : COMPLETE

#### **Users**
- ✅ `POST /users` : CREATE
- ✅ `PATCH /users/:id` : UPDATE, ROLE_CHANGE
- ✅ `POST /users/:id/activate` : ACTIVATE
- ✅ `POST /users/:id/deactivate` : DEACTIVATE

#### **Settings**
- ✅ `PATCH /settings` : UPDATE (organization settings)
- ✅ `PATCH /settings/organization` : UPDATE (organization data)
- ✅ `PATCH /calendar-config` : UPDATE (calendar config)

### **Endpoint Admin**
- ✅ `GET /admin/audit-logs` : Pagination cursor, filtres (entityType, entityId, action, actorUserId)

### **Tests E2E**
- ✅ Test 1 : Audit log sur lead update (QUALIFY)
- ✅ Test 2 : Audit log sur form update (PUBLISH)
- ✅ Test 3 : Endpoint admin avec filtres

## ⚠️ POINTS D'ATTENTION

### **1. Performance**
- L'audit log est asynchrone et ne fait pas échouer l'opération principale
- Les données sensibles sont automatiquement sanitizées (password, token, etc.)
- Les index sur `organizationId`, `entityType`, `entityId`, `action`, `createdAt` pour performance

### **2. Sécurité**
- Les audit logs sont isolés par `organizationId` (multi-tenant)
- L'endpoint admin est protégé par `@RequireRoles('ADMIN', 'SUPER_ADMIN')`
- Les données sensibles sont exclues avant sérialisation JSON

### **3. Données Enregistrées**
- **beforeJson** : État avant la mutation (champs critiques uniquement)
- **afterJson** : État après la mutation (champs critiques uniquement)
- **ip** et **userAgent** : Pour traçabilité
- **actorUserId** : null si action système (ex: assign automatique)

### **4. Actions Détectées Automatiquement**
- **QUALIFY** : Si status passe à QUALIFIED
- **DISQUALIFY** : Si status passe à DISQUALIFIED
- **ASSIGN** : Si assignedCloserId change
- **PUBLISH** : Si status passe à ACTIVE (form)
- **STATUS_CHANGE** : Si status change (form)
- **ROLE_CHANGE** : Si role change (user)
- **CANCEL** : Si status passe à CANCELLED (appointment)
- **UPDATE** : Par défaut pour les autres modifications

## ✅ VALIDATION

- [x] Table `AuditLog` créée
- [x] `AuditLogService` créé
- [x] Intégration dans LeadsService (update, assign)
- [x] Intégration dans FormsService (update, publish)
- [x] Intégration dans SchedulingService (create, update, no-show, complete)
- [x] Intégration dans UsersService (create, update, activate, deactivate)
- [x] Intégration dans SettingsService (update settings, update org)
- [x] Intégration dans CalendarConfigService (update)
- [x] Endpoint admin `GET /admin/audit-logs` créé
- [x] Décorateur `@RequireRoles` créé
- [x] `RolesGuard` mis à jour
- [x] Tests E2E créés (2 tests)
- [ ] Migration Prisma à créer

## 🔄 PROCHAINES ÉTAPES

1. **Créer la migration Prisma** :
   ```bash
   cd apps/api
   pnpm prisma migrate dev --name add_audit_logs
   ```

2. **Tester** :
   ```bash
   # Backend
   pnpm test:e2e:local
   ```

3. **Optimisations futures** :
   - Archivage automatique des logs anciens (> 1 an)
   - Export CSV des audit logs
   - Alertes sur actions suspectes (ex: nombreuses suppressions)
   - Dashboard de visualisation des audit logs

---

**Date** : 2025-01-27  
**Auteur** : Implémentation audit log minimal  
**Version** : 1.0.0
