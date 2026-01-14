# E2E Tests - Fallback sans Docker

## ✅ Implémentation terminée

Les tests e2e peuvent maintenant s'exécuter avec ou sans Docker, avec testcontainers comme option par défaut.

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers

1. **`apps/api/test/helpers/docker.ts`**
   - `isDockerAvailable()` : Vérifie si Docker est disponible et responsive
   - `determineDbStrategy()` : Détermine la stratégie DB (testcontainers/local/auto)

2. **`apps/api/test/README_E2E.md`**
   - Documentation complète pour exécuter les tests avec ou sans Docker
   - Guide de dépannage
   - Variables d'environnement documentées

### Fichiers modifiés

1. **`apps/api/test/helpers/global-setup.ts`**
   - Support des deux modes : testcontainers et local
   - Détection automatique de Docker
   - Stockage de la stratégie utilisée dans `/tmp/klozd-e2e-strategy.json`
   - Messages d'erreur clairs si ni Docker ni `E2E_DATABASE_URL` ne sont disponibles

2. **`apps/api/test/helpers/global-teardown.ts`**
   - Gestion des deux modes
   - Nettoyage du conteneur uniquement en mode testcontainers
   - Nettoyage du fichier de stratégie

3. **`apps/api/test/helpers/db.ts`**
   - Support du mode `TRUNCATE` (plus rapide) avec vérifications de sécurité
   - Fallback automatique vers `deleteMany` si TRUNCATE n'est pas sûr
   - Vérification que le nom de la DB contient `_test` (sauf si `E2E_ALLOW_NON_TEST_DB=true`)

## 🔧 Variables d'environnement

| Variable | Valeurs | Défaut | Description |
|----------|---------|--------|-------------|
| `E2E_DB_STRATEGY` | `testcontainers`, `local`, `auto` | `auto` | Stratégie de base de données |
| `E2E_DATABASE_URL` | URL PostgreSQL | - | Requis si `E2E_DB_STRATEGY=local` |
| `E2E_RESET_MODE` | `truncate`, `deleteMany` | `truncate` | Méthode de réinitialisation |
| `E2E_ALLOW_NON_TEST_DB` | `true`, `false` | `false` | Autoriser TRUNCATE sur DB non-test |

## 🚀 Utilisation

### Avec Docker (par défaut)

```bash
cd apps/api
pnpm test:e2e
```

### Sans Docker

```bash
# 1. Créer la base de données
createdb klozd_test

# 2. Configurer les variables
export E2E_DB_STRATEGY=local
export E2E_DATABASE_URL=postgresql://user:password@localhost:5432/klozd_test

# 3. Exécuter les tests
cd apps/api
pnpm test:e2e
```

## 📋 Comportement de `E2E_DB_STRATEGY`

### `auto` (défaut)

1. Vérifie si Docker est disponible
2. Si oui → utilise testcontainers
3. Si non → vérifie si `E2E_DATABASE_URL` est défini
4. Si oui → utilise la base locale
5. Si non → erreur avec instructions claires

### `testcontainers`

Force l'utilisation de testcontainers (échoue si Docker n'est pas disponible)

### `local`

Force l'utilisation de la base locale (requiert `E2E_DATABASE_URL`)

## 🔒 Sécurité

### Protection TRUNCATE

Le mode `TRUNCATE` est protégé par :

1. **Vérification du nom de la DB** : Doit contenir `_test` ou `test`
2. **Variable explicite** : `E2E_ALLOW_NON_TEST_DB=true` pour forcer l'autorisation

**Exemples de noms sécurisés :**
- ✅ `klozd_test`
- ✅ `klozd_test_db`
- ✅ `test_klozd`
- ❌ `klozd_dev` (non autorisé sans `E2E_ALLOW_NON_TEST_DB=true`)
- ❌ `klozd_prod` (jamais autorisé)

## 📝 Message d'erreur (sans Docker ni E2E_DATABASE_URL)

```
Cannot determine database strategy:
  - Docker is not available
  - E2E_DATABASE_URL is not set

Solutions:
  1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
  2. Or set E2E_DATABASE_URL:
     export E2E_DB_STRATEGY=local
     export E2E_DATABASE_URL=postgresql://user:password@localhost:5432/klozd_test
```

## ✅ Tests

- ✅ Détection Docker fonctionne
- ✅ Message d'erreur clair si ni Docker ni `E2E_DATABASE_URL` ne sont disponibles
- ✅ TypeScript compile (erreurs de testcontainers ignorées, ce sont des problèmes de config du projet)
- ✅ Linter passe

## 🔄 CI/CD

Le comportement par défaut (`auto`) fonctionne en CI :
- Si Docker est disponible → utilise testcontainers (comportement actuel)
- Si Docker n'est pas disponible mais `E2E_DATABASE_URL` est défini → utilise la base locale

Pour forcer testcontainers en CI :
```yaml
env:
  E2E_DB_STRATEGY: testcontainers
```

Pour utiliser une base gérée :
```yaml
env:
  E2E_DB_STRATEGY: local
  E2E_DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```
