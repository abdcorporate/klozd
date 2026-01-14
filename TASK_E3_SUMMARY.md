# Task E3: Admin Endpoint pour FailedJob DLQ - Résumé

## ✅ Implémentation terminée

### Fichiers créés

1. **`apps/api/src/admin/jobs/admin-jobs.module.ts`**
   - Module NestJS pour les endpoints admin des jobs

2. **`apps/api/src/admin/jobs/admin-jobs.service.ts`**
   - Service pour gérer les jobs échoués
   - Méthode `getFailedJobs()` avec pagination cursor
   - Méthode `deleteFailedJob()` pour supprimer un job

3. **`apps/api/src/admin/jobs/admin-jobs.controller.ts`**
   - Controller avec endpoints protégés
   - `GET /admin/jobs/failed` - Liste paginée des jobs échoués
   - `DELETE /admin/jobs/failed/:id` - Supprimer un job échoué

### Fichiers modifiés

1. **`apps/api/src/app.module.ts`**
   - Ajout de `AdminJobsModule` dans les imports

## Endpoints

### GET /admin/jobs/failed

**Description :** Récupère la liste paginée des jobs échoués (DLQ)

**Autorisation :** ADMIN ou SUPER_ADMIN uniquement

**Query Parameters :**
- `limit` (optionnel, défaut: 50, max: 100) - Nombre d'éléments par page
- `cursor` (optionnel) - Curseur de pagination (base64)
- `sortBy` (optionnel, défaut: createdAt) - Champ de tri
- `sortOrder` (optionnel, défaut: desc) - Ordre de tri (asc|desc)
- `q` (optionnel) - Recherche dans `jobName` et `errorMessage`
- `queueName` (optionnel) - Filtre exact par nom de queue

**Réponse :**
```json
{
  "items": [
    {
      "id": "cuid123",
      "queueName": "notifications",
      "jobName": "SEND_EMAIL",
      "jobData": "{\"to\":\"user@example.com\",\"subject\":\"...\"}",
      "errorMessage": "Connection timeout",
      "jobId": "bullmq-job-id",
      "attemptsMade": 5,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pageInfo": {
    "limit": 50,
    "nextCursor": "eyJpZCI6ImN1aWQxMjMiLCJjcmVhdGVkQXQiOiIyMDI0LTAxLTE1VDEwOjAwOjAwLjAwMFoifQ==",
    "hasNextPage": true
  }
}
```

### DELETE /admin/jobs/failed/:id

**Description :** Supprime un job échoué de la base de données

**Autorisation :** ADMIN ou SUPER_ADMIN uniquement

**Path Parameters :**
- `id` - ID du job échoué à supprimer

**Réponse :**
```json
{
  "message": "Job échoué supprimé avec succès"
}
```

## Sécurité

- **JWT Guard** : Tous les endpoints nécessitent une authentification JWT
- **Role Guard** : Vérification manuelle dans le controller et le service
- **Rôles autorisés** : `ADMIN` et `SUPER_ADMIN` uniquement
- Les autres rôles reçoivent une erreur `403 Forbidden`

## Pagination

Utilise le système de pagination cursor standard du projet :
- Tri par défaut : `createdAt desc` avec `id` comme tie-breaker
- Support des filtres : `queueName` (exact match), `q` (recherche textuelle)
- Format de réponse : `{ items, pageInfo: { limit, nextCursor, hasNextPage } }`

## Documentation Swagger

Tous les endpoints sont documentés avec :
- `@ApiTags('Admin - Jobs')`
- `@ApiOperation` avec description
- `@ApiQuery` pour tous les paramètres
- `@ApiResponse` pour les codes de statut

## Tests locaux

### Prérequis

1. API en cours d'exécution sur `http://localhost:3001`
2. Token JWT d'un utilisateur avec le rôle `ADMIN` ou `SUPER_ADMIN`

### Obtenir un token JWT

```bash
# Se connecter en tant qu'admin
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "votre-mot-de-passe"
  }'

# Réponse :
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   ...
# }
```

### Exemples curl

#### 1. Lister les jobs échoués (première page)

```bash
curl -X GET "http://localhost:3001/admin/jobs/failed?limit=10" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

#### 2. Lister avec filtre par queue

```bash
curl -X GET "http://localhost:3001/admin/jobs/failed?limit=20&queueName=notifications" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

#### 3. Recherche textuelle

```bash
curl -X GET "http://localhost:3001/admin/jobs/failed?q=SEND_EMAIL&limit=25" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

#### 4. Pagination avec cursor

```bash
# Première page
curl -X GET "http://localhost:3001/admin/jobs/failed?limit=10" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"

# Page suivante (utiliser le nextCursor de la réponse précédente)
curl -X GET "http://localhost:3001/admin/jobs/failed?limit=10&cursor=eyJpZCI6ImN1aWQxMjMiLCJjcmVhdGVkQXQiOiIyMDI0LTAxLTE1VDEwOjAwOjAwLjAwMFoifQ==" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

#### 5. Tri personnalisé

```bash
# Trier par jobName asc
curl -X GET "http://localhost:3001/admin/jobs/failed?sortBy=jobName&sortOrder=asc&limit=20" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

#### 6. Supprimer un job échoué

```bash
curl -X DELETE "http://localhost:3001/admin/jobs/failed/cuid123" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

#### 7. Test d'accès refusé (utilisateur non-admin)

```bash
# Avec un token d'un utilisateur CLOSER ou MANAGER
curl -X GET "http://localhost:3001/admin/jobs/failed" \
  -H "Authorization: Bearer TOKEN_NON_ADMIN"

# Réponse attendue : 403 Forbidden
# {
#   "statusCode": 403,
#   "message": "Seuls les administrateurs peuvent consulter les jobs échoués"
# }
```

## Vérification

1. **Vérifier que le module est chargé :**
   - Démarrer l'API : `cd apps/api && pnpm start:dev`
   - Vérifier les logs : le module `AdminJobsModule` doit être chargé

2. **Vérifier Swagger :**
   - Ouvrir `http://localhost:3001/api-docs`
   - Chercher la section "Admin - Jobs"
   - Vérifier que les endpoints sont documentés

3. **Tester avec un utilisateur admin :**
   - Se connecter avec un compte ADMIN ou SUPER_ADMIN
   - Appeler `GET /admin/jobs/failed`
   - Vérifier la réponse paginée

4. **Tester l'accès refusé :**
   - Se connecter avec un compte CLOSER ou MANAGER
   - Appeler `GET /admin/jobs/failed`
   - Vérifier l'erreur 403

## Notes

- Les jobs échoués sont automatiquement enregistrés dans le DLQ par `NotificationsProcessor` après 5 tentatives
- La pagination utilise le système cursor standard du projet (compatible avec les autres endpoints)
- Les filtres `queueName` et `q` peuvent être combinés
- Le tri par défaut est `createdAt desc` (les plus récents en premier)
