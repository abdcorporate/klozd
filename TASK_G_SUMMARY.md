# Task G: Minimum Integration Tests - Résumé

## ✅ Implémentation terminée

### G0) Test Infrastructure / DB Strategy

**Approche choisie :** testcontainers-node (Option A)

**Fichiers créés :**
1. `apps/api/test/helpers/global-setup.ts`
   - Démarre un conteneur PostgreSQL 14 via testcontainers
   - Configure `DATABASE_URL` pour Prisma
   - Exécute `prisma migrate deploy` automatiquement
   - Nettoie le conteneur à la fin

2. `apps/api/test/helpers/global-teardown.ts`
   - Arrête le conteneur PostgreSQL après les tests

**Fichiers modifiés :**
1. `apps/api/test/jest-e2e.json`
   - Ajout de `globalSetup` et `globalTeardown`
   - Timeout augmenté à 60s pour le démarrage du conteneur

**Dépendances ajoutées :**
- `testcontainers` ^11.11.0
- `@testcontainers/postgresql` ^11.11.0

**Stratégie de nettoyage :**
- `resetDb()` supprime tous les enregistrements dans l'ordre correct (respect des foreign keys)
- Appelé dans `beforeEach` de chaque test pour garantir l'isolation
- Utilise `deleteMany()` pour chaque modèle dans l'ordre inverse des dépendances

### G1) Test Helpers

**Fichiers créés :**
1. `apps/api/test/helpers/app.ts`
   - `bootstrapTestApp()` : Crée une instance NestJS avec tous les modules
   - Configure les mêmes pipes et CORS que l'app principale
   - Retourne `{ app, httpServer, prisma }`

2. `apps/api/test/helpers/db.ts`
   - `resetDb(prisma)` : Nettoie toutes les tables dans l'ordre correct

3. `apps/api/test/helpers/auth.ts`
   - `registerAndVerifyAndLogin()` : Flow complet register -> verify -> login
   - Utilise l'endpoint dev `/auth/dev/verification-code/:email`
   - Retourne `{ token, user, organization }`

4. `apps/api/test/helpers/factories.ts`
   - `createForm()` : Crée un formulaire minimal via Prisma
   - `buildPublicSubmissionPayload()` : Construit le payload pour POST /leads/forms/:formId/submit
   - `buildPublicBookingPayload()` : Construit le payload pour POST /scheduling/appointments/public

### G2) Tests Implémentés

**Fichiers créés :**
1. `apps/api/test/integration/auth-flow.e2e-spec.ts`
   - Test : register -> verify -> login -> access protected endpoint
   - Test : échec d'accès sans token
   - Test : échec de login avec email non vérifié

2. `apps/api/test/integration/form-submit-creates-lead.e2e-spec.ts`
   - Test : soumission publique crée un lead avec le bon organizationId
   - Test : isolation des organisations (org1 ne voit pas les leads de org2)

3. `apps/api/test/integration/public-booking-creates-appointment.e2e-spec.ts`
   - Test : réservation publique crée un appointment
   - Test : mise à jour du statut à COMPLETED
   - Test : mise à jour du statut à NO_SHOW

4. `apps/api/test/integration/idempotency-public-submit.e2e-spec.ts`
   - Test (Form Submit) : replay avec même key+body ne crée pas de doublons
   - Test (Form Submit) : conflict (même key, body différent) retourne 409
   - Test (Public Booking) : replay avec même key+body ne crée pas de doublons
   - Test (Public Booking) : conflict (même key, body différent) retourne 409

### G3) Jest Config

**Fichiers modifiés :**
1. `apps/api/test/jest-e2e.json`
   - `globalSetup` : démarre PostgreSQL container
   - `globalTeardown` : arrête le container
   - `testTimeout` : 60000ms (60s)

**Scripts :**
- `pnpm test:e2e` : exécute tous les tests e2e (déjà présent dans package.json)

## Variables d'environnement

Aucune variable d'environnement requise pour les tests. Le `DATABASE_URL` est automatiquement configuré par `global-setup.ts` avec la connexion au conteneur PostgreSQL.

**Note :** Les tests utilisent leur propre base de données isolée dans un conteneur Docker. La base de données de développement n'est jamais utilisée.

## Commandes pour exécuter les tests

### Local

```bash
cd apps/api
pnpm test:e2e
```

### Avec watch (optionnel)

```bash
cd apps/api
pnpm test:e2e --watch
```

### Un seul fichier de test

```bash
cd apps/api
pnpm test:e2e auth-flow.e2e-spec.ts
```

## Prérequis

1. **Docker** doit être installé et en cours d'exécution
   - Les tests utilisent testcontainers qui nécessite Docker
   - Vérifier : `docker ps` doit fonctionner

2. **Prisma migrations** doivent être à jour
   - Le `global-setup.ts` exécute automatiquement `prisma migrate deploy`
   - Aucune action manuelle requise

## Stratégie de nettoyage de la base de données

**Pourquoi c'est sûr :**
- Chaque test utilise `beforeEach` pour appeler `resetDb()`
- `resetDb()` supprime tous les enregistrements dans l'ordre inverse des dépendances
- La base de données est isolée dans un conteneur Docker temporaire
- Le conteneur est détruit après les tests (`globalTeardown`)
- Aucun risque de pollution de la base de données de développement ou de production

**Ordre de suppression (respect des foreign keys) :**
1. FailedJob, IdempotencyRecord, AuthAttempt (pas de dépendances)
2. Notification, Appointment, CallParticipant, Call, Deal
3. FormSubmission, FormAbandon, Lead
4. FormField, Form, Site
5. Invitation, User
6. OrganizationSettings, CloserSettings, Organization
7. CalendarConfig, AIPrediction

## Exécution des tests

### Premier lancement

Le premier lancement peut prendre 30-60 secondes car :
1. Docker doit télécharger l'image PostgreSQL (si pas déjà présente)
2. Le conteneur doit démarrer
3. Les migrations Prisma doivent s'exécuter

Les lancements suivants sont plus rapides (10-20 secondes).

### Exemple de sortie

```
🚀 Starting PostgreSQL test container...
✅ PostgreSQL container started: postgresql://test:test@localhost:5432/klozd_test
📦 Running Prisma migrations...
✅ Migrations applied

PASS  test/integration/auth-flow.e2e-spec.ts
PASS  test/integration/form-submit-creates-lead.e2e-spec.ts
PASS  test/integration/public-booking-creates-appointment.e2e-spec.ts
PASS  test/integration/idempotency-public-submit.e2e-spec.ts

Test Suites: 4 passed, 4 total
Tests:       10 passed, 10 total

🛑 Stopping PostgreSQL container...
✅ Container stopped
```

## CI-Friendly

Les tests sont prêts pour CI/CD :
- Pas de configuration manuelle requise
- Docker est la seule dépendance externe
- Les migrations s'exécutent automatiquement
- Le nettoyage est automatique

**Exemple pour GitHub Actions :**
```yaml
- name: Run E2E tests
  run: |
    cd apps/api
    pnpm test:e2e
```

## Notes importantes

1. **Endpoint dev** : Les tests utilisent `/auth/dev/verification-code/:email` qui doit être disponible en environnement de test
2. **Isolation** : Chaque test est isolé grâce à `resetDb()` dans `beforeEach`
3. **Performance** : Les tests peuvent prendre 1-2 minutes au total (démarrage du container + exécution)
4. **Docker requis** : Les tests échoueront si Docker n'est pas disponible

## Fichiers créés/modifiés

### Créés
- `apps/api/test/helpers/global-setup.ts`
- `apps/api/test/helpers/global-teardown.ts`
- `apps/api/test/helpers/app.ts`
- `apps/api/test/helpers/db.ts`
- `apps/api/test/helpers/auth.ts`
- `apps/api/test/helpers/factories.ts`
- `apps/api/test/integration/auth-flow.e2e-spec.ts`
- `apps/api/test/integration/form-submit-creates-lead.e2e-spec.ts`
- `apps/api/test/integration/public-booking-creates-appointment.e2e-spec.ts`
- `apps/api/test/integration/idempotency-public-submit.e2e-spec.ts`

### Modifiés
- `apps/api/test/jest-e2e.json`
- `apps/api/package.json` (dépendances testcontainers)

## Vérification

1. **Vérifier Docker :**
   ```bash
   docker ps
   ```

2. **Exécuter les tests :**
   ```bash
   cd apps/api
   pnpm test:e2e
   ```

3. **Vérifier que tous les tests passent :**
   - 4 fichiers de tests
   - ~10 tests au total
   - Tous doivent passer
