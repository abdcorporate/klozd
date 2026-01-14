# Task F: Observability Minimum - Résumé

## ✅ Implémentation terminée

### F1) Structured Logging + RequestId

**Fichiers créés :**
1. `apps/api/src/common/middleware/request-id.middleware.ts`
   - Génère un UUID si `x-request-id` manquant
   - Écho dans le header de réponse `x-request-id`
   - Attache au request pour utilisation dans controllers/services

2. `apps/api/src/common/interceptors/http-logging.interceptor.ts`
   - Log chaque requête HTTP avec : method, url, statusCode, durationMs, requestId, userId, organizationId
   - Format structuré JSON (production) ou pretty (dev)

**Fichiers modifiés :**
1. `apps/api/src/app.module.ts`
   - Configuration Pino avec `LoggerModule.forRootAsync`
   - JSON logs en production, pretty logs en dev
   - Ajout du middleware `RequestIdMiddleware`
   - Ajout de l'interceptor `HttpLoggingInterceptor`

2. `apps/api/src/common/filters/http-exception.filter.ts`
   - Intégration du requestId dans les logs d'erreur
   - Intégration Sentry pour les erreurs serveur (500+)

**Dépendances ajoutées :**
- `nestjs-pino` ^4.5.0
- `pino-http` ^11.0.0
- `pino-pretty` ^13.1.3
- `uuid` ^13.0.0

**Variables d'environnement :**
- `LOG_LEVEL` (défaut: `info`) - Niveau de log (debug, info, warn, error)
- `LOG_PRETTY` (défaut: `true` en dev, `false` en prod) - Format pretty ou JSON
- `NODE_ENV` - Détermine automatiquement le format (JSON si `production`)

### F2) Health Endpoint

**Fichiers créés :**
1. `apps/api/src/health/health.module.ts`
2. `apps/api/src/health/health.controller.ts`
3. `apps/api/src/health/health.service.ts`

**Endpoint :**
- `GET /health` - Vérifie l'état de santé de l'API, DB et Redis

**Réponse :**
```json
{
  "status": "ok" | "degraded",
  "checks": {
    "db": {
      "ok": true,
      "latencyMs": 5
    },
    "redis": {
      "ok": true,
      "latencyMs": 2,
      "enabled": true
    }
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

**Fichiers modifiés :**
1. `apps/api/src/app.controller.ts` - Suppression de l'ancien endpoint `/health`
2. `apps/api/src/app.module.ts` - Ajout de `HealthModule`

**Comportement :**
- DB : Requête `SELECT 1` via Prisma pour vérifier la connexion
- Redis : Ping Redis seulement si `QUEUE_ENABLED=true`
- Ne lève pas d'exception, retourne `status: "degraded"` si un check échoue

### F3) Sentry Scaffolding

**API - Fichiers créés :**
1. `apps/api/src/common/sentry/sentry.service.ts`
   - Initialisation Sentry conditionnelle (`SENTRY_ENABLED=true` + `SENTRY_DSN`)
   - Scrub des données sensibles (Authorization headers, request body)
   - Méthodes `captureException()` et `captureMessage()` avec requestId

2. `apps/api/src/common/sentry/sentry.module.ts`
   - Module global pour Sentry

**API - Fichiers modifiés :**
1. `apps/api/src/common/filters/http-exception.filter.ts`
   - Envoi automatique des erreurs 500+ à Sentry avec requestId

2. `apps/api/src/app.module.ts`
   - Ajout de `SentryModule`

**Web - Fichiers créés :**
1. `apps/web/sentry.client.config.ts` - Configuration Sentry côté client
2. `apps/web/sentry.server.config.ts` - Configuration Sentry côté serveur

**Dépendances ajoutées :**
- API : `@sentry/node` ^10.34.0, `@sentry/tracing` ^7.120.4, `@sentry/profiling-node` ^10.34.0
- Web : `@sentry/nextjs` ^10.34.0

**Variables d'environnement :**
- `SENTRY_ENABLED` (défaut: `false`) - Activer/désactiver Sentry
- `SENTRY_DSN` - DSN Sentry pour l'API
- `NEXT_PUBLIC_SENTRY_DSN` - DSN Sentry pour le client Next.js
- `SENTRY_ENVIRONMENT` (défaut: `NODE_ENV`) - Environnement (development, staging, production)
- `SENTRY_TRACES_SAMPLE_RATE` (défaut: `0.05`) - Taux d'échantillonnage des traces (5%)

## Configuration

### Variables d'environnement API (`apps/api/.env`)

```env
# Logging
LOG_LEVEL=info
LOG_PRETTY=true  # false en production
NODE_ENV=development

# Sentry
SENTRY_ENABLED=false
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.05
```

### Variables d'environnement Web (`apps/web/.env.local`)

```env
# Sentry
SENTRY_ENABLED=false
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.05
```

## Tests

### 1. Vérifier le requestId dans les headers

```bash
curl -i http://localhost:3001/health

# Réponse attendue :
# x-request-id: 550e8400-e29b-41d4-a716-446655440000
```

### 2. Vérifier les logs structurés

Démarrer l'API et faire une requête :

```bash
curl http://localhost:3001/health
```

**Logs attendus (dev, format pretty) :**
```
[10:00:00.123] INFO: GET /health 200 - 5ms
    requestId: "550e8400-e29b-41d4-a716-446655440000"
    method: "GET"
    url: "/health"
    statusCode: 200
    durationMs: 5
```

**Logs attendus (prod, format JSON) :**
```json
{"level":30,"time":1705312800123,"pid":12345,"hostname":"server","requestId":"550e8400-e29b-41d4-a716-446655440000","method":"GET","url":"/health","statusCode":200,"durationMs":5,"msg":"GET /health 200 - 5ms"}
```

### 3. Tester l'endpoint /health

```bash
curl http://localhost:3001/health | jq
```

**Réponse attendue :**
```json
{
  "status": "ok",
  "checks": {
    "db": {
      "ok": true,
      "latencyMs": 5
    },
    "redis": {
      "ok": true,
      "latencyMs": 2,
      "enabled": true
    }
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### 4. Tester avec Redis désactivé

```env
QUEUE_ENABLED=false
```

```bash
curl http://localhost:3001/health | jq
```

**Réponse attendue :**
```json
{
  "status": "ok",
  "checks": {
    "db": {
      "ok": true,
      "latencyMs": 5
    },
    "redis": {
      "ok": false,
      "enabled": false
    }
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### 5. Tester Sentry (optionnel)

Pour tester Sentry localement, vous pouvez créer une route de test :

```typescript
// Dans un controller
@Get('test-sentry')
testSentry() {
  throw new Error('Test Sentry error');
}
```

Puis appeler :
```bash
curl http://localhost:3001/test-sentry
```

Vérifier dans le dashboard Sentry que l'erreur est capturée avec le requestId.

## Vérification

1. **Vérifier que le requestId est présent :**
   ```bash
   curl -i http://localhost:3001/health | grep x-request-id
   ```

2. **Vérifier les logs :**
   - Démarrer l'API : `cd apps/api && pnpm start:dev`
   - Faire quelques requêtes
   - Vérifier que chaque log contient `requestId`

3. **Vérifier /health :**
   ```bash
   curl http://localhost:3001/health
   ```

4. **Vérifier Swagger :**
   - Ouvrir `http://localhost:3001/api-docs`
   - Chercher la section "Health"
   - Vérifier la documentation de l'endpoint

5. **Vérifier la compilation :**
   ```bash
   cd apps/api && pnpm typecheck
   cd apps/web && pnpm typecheck
   ```

## Notes

- **Logs structurés** : Tous les logs incluent maintenant `requestId`, `userId` et `organizationId` quand disponibles
- **Pas de PII** : Les emails et numéros de téléphone ne sont pas loggés
- **Sentry** : Désactivé par défaut, activé seulement si `SENTRY_ENABLED=true` et DSN configuré
- **Health checks** : Ne lèvent jamais d'exception, retournent toujours un statut (ok ou degraded)
- **RequestId** : Présent dans tous les headers de réponse et tous les logs
