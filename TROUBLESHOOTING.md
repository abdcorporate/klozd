# 🔧 Dépannage - KLOZD

## Problèmes courants et solutions

### ❌ Erreur Prisma : `ERR_REQUIRE_ESM`

**Symptôme** :
```
Error [ERR_REQUIRE_ESM]: require() of ES Module .../zeptomatch/dist/index.js
```

**Cause** : Conflit entre Prisma 7.x et pnpm

**Solution** :
1. Le projet utilise Prisma 6.1.0 par défaut (stable avec pnpm)
2. Si tu veux utiliser Prisma 7, tu peux :
   - Utiliser `npm` au lieu de `pnpm`
   - Ou ajouter un fichier `.npmrc` dans `apps/api/` avec :
     ```
     shamefully-hoist=true
     public-hoist-pattern[]=*prisma*
     ```

### ❌ Erreur : "Cannot connect to database"

**Vérifications** :
1. PostgreSQL est démarré :
   ```bash
   # macOS
   brew services list
   brew services start postgresql@14
   
   # Linux
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. La base de données existe :
   ```bash
   psql -U ton_user -d klozd
   ```

3. La `DATABASE_URL` dans `apps/api/.env` est correcte :
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/klozd?schema=public"
   ```

### ❌ Erreur : "Prisma Client not generated"

```bash
cd apps/api
pnpm prisma:generate
```

### ❌ Erreur : "Port already in use"

**API** : Change le port dans `apps/api/.env` :
```env
PORT=3002
```

**Web** : Change l'URL dans `apps/web/.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### ❌ Erreur CORS

Vérifie que `FRONTEND_URL` dans `apps/api/.env` correspond :
```env
FRONTEND_URL="http://localhost:3000"
```

### ❌ Erreur : "Module not found" dans Next.js

```bash
cd apps/web
pnpm install
```

### ❌ Erreur : "JWT_SECRET not set"

Assure-toi que `apps/api/.env` contient :
```env
JWT_SECRET="une-cle-secrete-longue-et-aleatoire"
```

### ❌ Erreur : "Build scripts ignored" (pnpm)

Si Prisma ne fonctionne pas, autorise les scripts :
```bash
cd apps/api
pnpm approve-builds
# Sélectionne prisma et @prisma/engines
```

### ❌ Erreur : "Cannot find module '@prisma/client'"

```bash
cd apps/api
pnpm install
pnpm prisma:generate
```

## Commandes de réinitialisation

Si tout ne fonctionne pas, réinitialise :

```bash
# 1. Nettoyer les node_modules
rm -rf node_modules apps/*/node_modules

# 2. Réinstaller
pnpm install

# 3. Régénérer Prisma
cd apps/api
pnpm prisma:generate

# 4. Réappliquer les migrations
pnpm prisma migrate reset  # ⚠️ Supprime toutes les données
# OU
pnpm prisma migrate deploy  # Applique les migrations existantes
```

## Support

Si le problème persiste :
1. Vérifie les logs : `pnpm dev:api` et `pnpm dev:web`
2. Vérifie que tous les prérequis sont installés : `./check-setup.sh`
3. Consulte la documentation : [SETUP.md](./SETUP.md)





