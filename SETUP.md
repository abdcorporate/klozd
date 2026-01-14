# 🚀 Guide de Configuration - KLOZD

## Étape 1 : Vérifier les prérequis

Avant de commencer, assure-toi d'avoir :

- ✅ **Node.js 20+** : `node --version`
- ✅ **pnpm 10+** : `pnpm --version`
- ✅ **PostgreSQL 14+** : `psql --version`

Si PostgreSQL n'est pas installé :
- **macOS** : `brew install postgresql@14` puis `brew services start postgresql@14`
- **Linux** : `sudo apt install postgresql-14`
- **Windows** : Télécharger depuis [postgresql.org](https://www.postgresql.org/download/)

## Étape 2 : Créer la base de données PostgreSQL

```bash
# Se connecter à PostgreSQL
psql postgres

# Créer la base de données
CREATE DATABASE klozd;

# Créer un utilisateur (optionnel, tu peux utiliser ton utilisateur par défaut)
CREATE USER klozd_user WITH PASSWORD 'ton_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE klozd TO klozd_user;

# Quitter psql
\q
```

## Étape 3 : Configurer l'API (Backend)

Créer le fichier `.env` dans `apps/api/` :

```bash
cd apps/api
touch .env
```

Puis éditer le fichier `.env` avec ce contenu :

```env
# Base de données
DATABASE_URL="postgresql://ton_user:ton_password@localhost:5432/klozd?schema=public"

# JWT (génère une clé aléatoire pour la production)
JWT_SECRET="changez-moi-en-production-avec-une-cle-secrete-longue-et-aleatoire"
JWT_EXPIRES_IN="7d"

# Application
PORT=3001
NODE_ENV=development

# Frontend URL (pour CORS)
FRONTEND_URL="http://localhost:3000"

# Optionnel : Services externes (à configurer plus tard)
# EMAIL_API_KEY=""
# SMS_API_KEY=""
# WHATSAPP_API_KEY=""
# OPENAI_API_KEY=""
```

**Important** : Remplace `ton_user` et `ton_password` par tes identifiants PostgreSQL.

## Étape 4 : Générer le client Prisma et créer les tables

```bash
# Depuis apps/api/
cd apps/api

# Générer le client Prisma
pnpm prisma:generate

# Créer les migrations et appliquer au schéma
pnpm prisma migrate dev --name init
```

Cette commande va :
- Créer le dossier `prisma/migrations/`
- Générer les tables dans PostgreSQL
- Créer le client Prisma TypeScript

**Note** : 
- En **développement**, utilise toujours `pnpm prisma migrate dev` pour créer et appliquer les migrations.
- En **production**, utilise `pnpm prisma migrate deploy` pour appliquer les migrations existantes.
- Si tu rencontres une erreur `ERR_REQUIRE_ESM` avec Prisma 7.x, c'est un problème connu avec pnpm. Le projet utilise Prisma 6.1.0 qui est stable.

## Étape 5 : Configurer le Frontend

Créer le fichier `.env.local` dans `apps/web/` :

```bash
cd apps/web
touch .env.local
```

Puis éditer le fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Étape 6 : Installer les dépendances (si pas déjà fait)

Depuis la racine du projet :

```bash
pnpm install
```

## Étape 7 : Démarrer les applications

### Option 1 : Démarrer les deux en même temps

Depuis la racine du projet :

```bash
pnpm dev
```

Cela démarre :
- API sur http://localhost:3001
- Web sur http://localhost:3000

### Option 2 : Démarrer séparément

Terminal 1 (API) :
```bash
pnpm dev:api
```

Terminal 2 (Web) :
```bash
pnpm dev:web
```

## ✅ Vérification

1. **API** : Ouvre http://localhost:3001/health
   - Tu devrais voir : `{"status":"ok"}`

2. **Web** : Ouvre http://localhost:3000
   - Tu devrais être redirigé vers `/login`

3. **Créer un compte** :
   - Va sur http://localhost:3000/register
   - Crée un compte (cela crée aussi une organisation)
   - Tu seras redirigé vers le dashboard

## 🔧 Dépannage

### Erreur : "Cannot connect to database"

1. Vérifie que PostgreSQL est démarré :
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Vérifie ta `DATABASE_URL` dans `apps/api/.env`

3. Teste la connexion :
   ```bash
   psql -U ton_user -d klozd
   ```

### Erreur : "Prisma Client not generated"

```bash
cd apps/api
pnpm prisma:generate
```

### Erreur : "Port already in use"

Change le port dans `apps/api/.env` :
```env
PORT=3002
```

Et dans `apps/web/.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Erreur CORS

Vérifie que `FRONTEND_URL` dans `apps/api/.env` correspond à l'URL de ton frontend.

## 📊 Prisma Studio (Optionnel)

Pour visualiser et éditer ta base de données :

```bash
cd apps/api
pnpm prisma:studio
```

Ouvre http://localhost:5555 dans ton navigateur.

## 🎯 Prochaines étapes

Une fois tout configuré :

1. ✅ Créer un compte sur http://localhost:3000/register
2. ✅ Explorer le dashboard
3. ✅ Créer un formulaire
4. ✅ Tester la soumission d'un formulaire
5. ✅ Voir les leads dans la liste

Bon développement ! 🚀

