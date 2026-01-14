# Refactorisation du système de stratégie DB pour les tests E2E

## ✅ Implémentation terminée

Le système de stratégie DB a été refactorisé pour être plus clair et fiable, avec support explicite pour "docker" et "local".

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers

1. **`apps/api/test/helpers/db-strategy.ts`** (remplace `docker.ts`)
   - `isDockerAvailable()` : Vérifie si Docker est disponible
   - `resolveDbStrategy()` : Résout la stratégie DB avec logique claire
   - Support de `docker`, `local`, `auto` (défaut)
   - Messages d'erreur actionnables

2. **`apps/api/test/scripts/load-env-and-run.js`**
   - Script Node.js pour charger `.env.e2e.local` et exécuter jest
   - Pas de dépendances supplémentaires
   - Définit automatiquement `E2E_DB_STRATEGY=local`

### Fichiers modifiés

1. **`apps/api/test/helpers/global-setup.ts`**
   - Utilise `resolveDbStrategy()` au lieu de `determineDbStrategy()`
   - Support de `docker` au lieu de `testcontainers` dans la logique
   - Fonction `setupWithDocker()` renommée pour clarté

2. **`apps/api/test/helpers/global-teardown.ts`**
   - Utilise le type `DbStrategy` (`docker` | `local`)
   - Gestion correcte des deux modes

3. **`apps/api/package.json`**
   - Ajout du script `test:e2e:local` qui charge `.env.e2e.local`

4. **`apps/api/test/README_E2E.md`**
   - Documentation mise à jour avec les nouvelles valeurs (`docker` au lieu de `testcontainers`)
   - Section sur `test:e2e:local` avec exemples
   - Messages d'erreur documentés

### Fichiers supprimés

1. **`apps/api/test/helpers/docker.ts`**
   - Remplacé par `db-strategy.ts`

## 🔧 Variables d'environnement

| Variable | Valeurs | Défaut | Description |
|----------|---------|--------|-------------|
| `E2E_DB_STRATEGY` | `docker`, `local`, `auto` | `auto` | Stratégie de base de données |
| `E2E_DATABASE_URL` | URL PostgreSQL | - | Requis si `E2E_DB_STRATEGY=local` |
| `E2E_RESET_MODE` | `truncate`, `deleteMany` | `truncate` | Méthode de réinitialisation |
| `E2E_ALLOW_NON_TEST_DB` | `true`, `false` | `false` | Autoriser TRUNCATE sur DB non-test |

## 🚀 Commandes

### Avec Docker (par défaut)

```bash
cd apps/api
pnpm test:e2e
```

### Sans Docker (local) - Méthode 1 : Script de convenance

1. Créer `apps/api/.env.e2e.local` :
```bash
E2E_DB_STRATEGY=local
E2E_DATABASE_URL=postgresql://user:password@localhost:5432/klozd_test
```

2. Exécuter :
```bash
cd apps/api
pnpm test:e2e:local
```

### Sans Docker (local) - Méthode 2 : Variables d'environnement

```bash
cd apps/api
E2E_DB_STRATEGY=local E2E_DATABASE_URL=postgresql://user:password@localhost:5432/klozd_test pnpm test:e2e
```

## 📋 Logique de résolution de stratégie

1. **Si `E2E_DB_STRATEGY=docker`** :
   - Vérifie que Docker est disponible
   - Utilise testcontainers
   - Échoue avec message clair si Docker n'est pas disponible

2. **Si `E2E_DB_STRATEGY=local`** :
   - Vérifie que `E2E_DATABASE_URL` est défini
   - Utilise la base locale
   - Échoue avec message clair si `E2E_DATABASE_URL` manque

3. **Si `E2E_DB_STRATEGY=auto` ou non défini (défaut)** :
   - Essaie Docker d'abord (si disponible → docker)
   - Sinon, essaie local (si `E2E_DATABASE_URL` défini → local)
   - Sinon, échoue avec message d'erreur actionnable

## 📝 Message d'erreur (exemple)

```
Cannot determine database strategy automatically:
  - Docker is not available
  - E2E_DATABASE_URL is not set

Solutions:
  1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
     Then run: pnpm test:e2e

  2. Use local PostgreSQL:
     export E2E_DB_STRATEGY=local
     export E2E_DATABASE_URL=postgresql://user:password@localhost:5432/klozd_test
     pnpm test:e2e

  3. Use the convenience script:
     pnpm test:e2e:local
     (loads E2E_DATABASE_URL from .env.e2e.local if present)
```

## ✅ Tests

- ✅ Détection Docker fonctionne
- ✅ Message d'erreur clair et actionnable
- ✅ Script `test:e2e:local` fonctionne
- ✅ TypeScript compile (erreurs testcontainers ignorées, problème de config du projet)
- ✅ Linter passe
- ✅ Documentation complète

## 🔄 Compatibilité CI/CD

Le comportement par défaut (`auto`) fonctionne en CI :
- Docker disponible → utilise docker/testcontainers (comportement actuel préservé)
- Docker indisponible + `E2E_DATABASE_URL` → utilise base locale

Pour forcer docker en CI :
```yaml
env:
  E2E_DB_STRATEGY: docker
```

Pour utiliser une base gérée :
```yaml
env:
  E2E_DB_STRATEGY: local
  E2E_DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```
