# Tâche A - Pagination API - Résumé

## 1. Endpoints mis à jour

### Endpoints prioritaires (A3)
- ✅ GET /leads
- ✅ GET /crm/deals
- ✅ GET /scheduling/appointments
- ✅ GET /notifications

### Endpoints supplémentaires (A3)
- ✅ GET /users
- ✅ GET /forms
- ✅ GET /sites

**Note:** Les endpoints webhooks n'existent pas dans le codebase actuel (seulement POST /webhooks/livekit pour recevoir des webhooks).

## 2. Fichiers modifiés

### Utilitaires de pagination (A1)
- `apps/api/src/common/pagination/pagination.dto.ts` (nouveau)
- `apps/api/src/common/pagination/pagination.util.ts` (nouveau)
- `apps/api/src/common/pagination/pagination.response.ts` (nouveau)
- `apps/api/src/common/pagination/index.ts` (nouveau)

### Services mis à jour
- `apps/api/src/leads/leads.service.ts`
- `apps/api/src/crm/crm.service.ts`
- `apps/api/src/scheduling/scheduling.service.ts`
- `apps/api/src/notifications/notifications.service.ts`
- `apps/api/src/users/users.service.ts`
- `apps/api/src/forms/forms.service.ts`
- `apps/api/src/sites/sites.service.ts`

### Controllers mis à jour
- `apps/api/src/leads/leads.controller.ts`
- `apps/api/src/crm/crm.controller.ts`
- `apps/api/src/scheduling/scheduling.controller.ts`
- `apps/api/src/notifications/notifications.controller.ts`
- `apps/api/src/users/users.controller.ts`
- `apps/api/src/forms/forms.controller.ts`
- `apps/api/src/sites/sites.controller.ts`

### Schéma Prisma (A4)
- `apps/api/prisma/schema.prisma` (index ajoutés)

## 3. Migration Prisma (A4)

**Nom de la migration:** `20260114201634_add_pagination_indexes`

**Localisation:** `apps/api/prisma/migrations/20260114201634_add_pagination_indexes/migration.sql`

**Index créés:**
- Lead: `(organizationId, createdAt DESC)`, `(organizationId, updatedAt DESC)`
- Deal: `(organizationId, createdAt DESC)`, `(organizationId, updatedAt DESC)`, `(organizationId, stage)`
- Appointment: `(leadId, scheduledAt ASC)`, `(assignedCloserId, scheduledAt ASC)`
- Notification: `(userId, createdAt DESC)`, `(userId, status)`
- User: `(organizationId, role)`, `(organizationId, createdAt DESC)`
- Form: `(organizationId, createdAt DESC)`, `(organizationId, status)`
- Site: `(organizationId, createdAt DESC)`, `(organizationId, status)`

**Pour appliquer la migration:**
```bash
cd apps/api
pnpm prisma migrate deploy
# ou en dev:
pnpm prisma migrate dev
```

## 4. Documentation Swagger/OpenAPI (A5)

Tous les endpoints paginés sont documentés avec:
- `@ApiOperation` avec description
- `@ApiQuery` pour chaque paramètre (limit, cursor, sortBy, sortOrder, q)
- `@ApiResponse` avec type `PaginatedResponse`

## 5. Commandes curl pour tester la pagination

**Prérequis:** Remplacer `YOUR_JWT_TOKEN` par un token JWT valide obtenu via login.

### 1. GET /leads (première page)
```bash
curl -X GET "http://localhost:3001/leads?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. GET /leads (page suivante avec cursor)
```bash
# Utiliser le nextCursor de la réponse précédente
curl -X GET "http://localhost:3001/leads?limit=10&cursor=YOUR_CURSOR_FROM_PREVIOUS_RESPONSE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. GET /crm/deals (avec recherche et tri)
```bash
curl -X GET "http://localhost:3001/crm/deals?limit=25&sortBy=createdAt&sortOrder=desc&q=test" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. GET /scheduling/appointments (tri par scheduledAt)
```bash
curl -X GET "http://localhost:3001/scheduling/appointments?limit=20&sortBy=scheduledAt&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 5. GET /notifications (première page)
```bash
curl -X GET "http://localhost:3001/notifications?limit=15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 6. GET /users (avec recherche)
```bash
curl -X GET "http://localhost:3001/users?limit=25&q=john" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Format de réponse attendu:**
```json
{
  "items": [...],
  "pageInfo": {
    "limit": 25,
    "nextCursor": "eyJpZCI6ImN1aWQxMjMiLCJjcmVhdGVkQXQiOiIyMDI0LTAxLTAxVDAwOjAwOjAwLjAwMFoifQ==",
    "hasNextPage": true
  }
}
```

