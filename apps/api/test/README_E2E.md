# Tests d'intégration E2E

Ce document explique comment exécuter les tests d'intégration avec ou sans Docker.

## 📋 Prérequis

- Node.js et pnpm installés
- PostgreSQL 14+ (pour le mode local)
- Docker Desktop (optionnel, pour le mode docker par défaut)

## 🚀 Exécution des tests

### Option 1 : Avec Docker (recommandé, par défaut)

Si Docker est installé et en cours d'exécution, les tests utilisent automatiquement testcontainers :

```bash
cd apps/api
pnpm test:e2e
```

**Avantages :**
- Isolation complète (conteneur PostgreSQL temporaire)
- Pas de configuration nécessaire
- Base de données créée et supprimée automatiquement

### Option 2 : Sans Docker (mode local)

**⚠️ Important :** En mode local, tous les tests partagent la même base de données (`klozd_test`). Les tests **doivent** s'exécuter séquentiellement pour éviter que les suites se réinitialisent mutuellement la base de données. Le script `test:e2e:local` force automatiquement l'exécution séquentielle avec `--runInBand`.

#### Méthode A : Script de convenance (recommandé)

1. Créer un fichier `.env.e2e.local` dans `apps/api/` :

```bash
# apps/api/.env.e2e.local
E2E_DB_STRATEGY=local
E2E_DATABASE_URL=postgresql://user:password@localhost:5432/klozd_test
```

2. Exécuter les tests :

```bash
cd apps/api
pnpm test:e2e:local
```

Le script charge automatiquement les variables depuis `.env.e2e.local` et force l'exécution séquentielle (`--runInBand` + `maxWorkers=1`).

#### Méthode B : Variables d'environnement manuelles

1. Créer la base de données de test :

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE klozd_test;
CREATE USER test_user WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE klozd_test TO test_user;
\q
```

2. Configurer les variables d'environnement :

```bash
export E2E_DB_STRATEGY=local
export E2E_DATABASE_URL=postgresql://test_user:test_password@localhost:5432/klozd_test
```

3. Exécuter les tests **avec --runInBand** (obligatoire en mode local) :

```bash
cd apps/api
pnpm jest --config ./test/jest-e2e.json --runInBand
```

**Note :** Utilisez `pnpm test:e2e:local` qui gère automatiquement l'exécution séquentielle.

## ⚙️ Variables d'environnement

| Variable | Valeurs | Défaut | Description |
|----------|---------|--------|-------------|
| `E2E_DB_STRATEGY` | `docker`, `local`, `auto` | `auto` | Stratégie de base de données |
| `E2E_DATABASE_URL` | URL PostgreSQL | - | Requis si `E2E_DB_STRATEGY=local` |
| `E2E_RESET_MODE` | `truncate`, `deleteMany` | `truncate` | Méthode de réinitialisation de la DB |
| `E2E_ALLOW_NON_TEST_DB` | `true`, `false` | `false` | Autoriser TRUNCATE sur des DB non-test |

### Comportement de `E2E_DB_STRATEGY`

- **`auto`** (défaut) :
  - Si Docker est disponible → utilise docker (testcontainers)
  - Sinon, si `E2E_DATABASE_URL` est défini → utilise la base locale
  - Sinon → erreur avec instructions claires

- **`docker`** :
  - Force l'utilisation de Docker/testcontainers (échoue si Docker n'est pas disponible)

- **`local`** :
  - Force l'utilisation de la base locale (requiert `E2E_DATABASE_URL`)

### Comportement de `E2E_RESET_MODE`

- **`truncate`** (défaut) :
  - Utilise `TRUNCATE TABLE ... CASCADE` (plus rapide)
  - Sécurité : uniquement si le nom de la DB contient `_test` ou si `E2E_ALLOW_NON_TEST_DB=true`
  - Sinon, fallback automatique vers `deleteMany`

- **`deleteMany`** :
  - Utilise `deleteMany()` pour chaque modèle (plus lent mais plus sûr)
  - Respecte l'ordre des foreign keys

## 🔒 Sécurité

### Protection contre les suppressions accidentelles

Le mode `TRUNCATE` est protégé par plusieurs vérifications :

1. **Nom de la base de données** : Doit contenir `_test` ou `test`
2. **Variable explicite** : `E2E_ALLOW_NON_TEST_DB=true` pour forcer l'autorisation

**Exemple de noms de DB sécurisés :**
- ✅ `klozd_test`
- ✅ `klozd_test_db`
- ✅ `test_klozd`
- ❌ `klozd_dev` (ne sera pas autorisé sans `E2E_ALLOW_NON_TEST_DB=true`)
- ❌ `klozd_prod` (ne sera jamais autorisé)

## 📝 Tests disponibles

Les tests d'intégration couvrent les flux critiques :

1. **`auth-flow.e2e-spec.ts`** : Flow complet d'authentification
   - Register → Verify → Login → Accès endpoint protégé

2. **`form-submit-creates-lead.e2e-spec.ts`** : Soumission publique de formulaire
   - Création de formulaire → Soumission publique → Lead créé avec bon scoping

3. **`public-booking-creates-appointment.e2e-spec.ts`** : Réservation publique
   - Réservation publique → Appointment créé → Mise à jour de statut

4. **`idempotency-public-submit.e2e-spec.ts`** : Tests d'idempotence
   - Replay (même clé, même body) → Pas de doublons
   - Conflit (même clé, body différent) → 409 Conflict

## 🐛 Dépannage

### Erreur : "Cannot determine database strategy automatically"

**Cause :** Docker n'est pas disponible et `E2E_DATABASE_URL` n'est pas défini.

**Solution :**
```bash
# Option 1 : Installer Docker Desktop
# https://www.docker.com/products/docker-desktop/

# Option 2 : Configurer une base locale
export E2E_DB_STRATEGY=local
export E2E_DATABASE_URL=postgresql://user:password@localhost:5432/klozd_test

# Option 3 : Utiliser le script de convenance
# Créer apps/api/.env.e2e.local avec E2E_DATABASE_URL
pnpm test:e2e:local
```

### Erreur : "E2E_DB_STRATEGY=docker requires Docker to be installed"

**Cause :** Vous avez forcé `E2E_DB_STRATEGY=docker` mais Docker n'est pas disponible.

**Solution :**
```bash
# Utiliser le mode local à la place
export E2E_DB_STRATEGY=local
export E2E_DATABASE_URL=postgresql://user:password@localhost:5432/klozd_test
```

### Erreur : "E2E_DB_STRATEGY=local requires E2E_DATABASE_URL"

**Cause :** Le mode local est activé mais `E2E_DATABASE_URL` n'est pas défini.

**Solution :**
```bash
export E2E_DATABASE_URL=postgresql://user:password@localhost:5432/klozd_test

# Ou utiliser le script de convenance avec .env.e2e.local
pnpm test:e2e:local
```

### Erreur : "TRUNCATE mode is not safe"

**Cause :** Le nom de la base de données ne contient pas `_test`.

**Solution :**
```bash
# Option 1 : Renommer la base de données
CREATE DATABASE klozd_test;

# Option 2 : Utiliser deleteMany à la place
export E2E_RESET_MODE=deleteMany

# Option 3 : Autoriser explicitement (non recommandé)
export E2E_ALLOW_NON_TEST_DB=true
```

### Erreur : "Migration failed"

**Cause :** Les migrations Prisma échouent.

**Solution :**
```bash
# Vérifier que la base de données est accessible
psql $E2E_DATABASE_URL -c "SELECT 1;"

# Vérifier que Prisma client est généré
cd apps/api
pnpm prisma generate

# Vérifier les migrations
pnpm prisma migrate status
```

## 📚 Commandes utiles

```bash
# Exécuter tous les tests e2e (auto-détection Docker)
pnpm test:e2e

# Exécuter avec base locale (charge .env.e2e.local)
pnpm test:e2e:local

# Exécuter un fichier de test spécifique
pnpm test:e2e form-submit-creates-lead

# Mode watch (si supporté)
pnpm test:e2e --watch

# Avec logs détaillés
DEBUG=* pnpm test:e2e
```

## 🔄 CI/CD

En CI/CD, le comportement par défaut (`auto`) utilisera Docker/testcontainers si Docker est disponible, ce qui est généralement le cas dans les pipelines CI modernes.

Pour forcer docker en CI :
```yaml
# .github/workflows/test.yml
env:
  E2E_DB_STRATEGY: docker
```

Pour utiliser une base de données gérée (ex: RDS) :
```yaml
env:
  E2E_DB_STRATEGY: local
  E2E_DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## 📖 Exemples de commandes

### Avec Docker (par défaut)
```bash
cd apps/api
pnpm test:e2e
```

### Sans Docker (local)
```bash
# Méthode 1 : Script de convenance
echo "E2E_DATABASE_URL=postgresql://user:pass@localhost:5432/klozd_test" > .env.e2e.local
pnpm test:e2e:local

# Méthode 2 : Variables d'environnement
E2E_DB_STRATEGY=local E2E_DATABASE_URL=postgresql://user:pass@localhost:5432/klozd_test pnpm test:e2e
```
