# Créer un SUPER_ADMIN via le Shell Render

## Méthode 1 : Utilisation du script existant (recommandé)

### 1. Ouvrir le Shell Render

1. Aller sur [render.com](https://render.com)
2. Sélectionner votre service **Web Service** (API)
3. Cliquer sur **Shell** dans la barre latérale
4. Un terminal s'ouvre directement dans l'environnement du service

### 2. Naviguer vers le répertoire de l'API

```bash
cd /opt/render/project/src/apps/api
```

**Note** : Le chemin peut varier selon votre configuration Render. Si `/opt/render/project/src/apps/api` n'existe pas, vérifier le chemin avec :
```bash
pwd
ls -la
```

### 3. Générer le client Prisma (si nécessaire)

```bash
pnpm prisma generate
```

### 4. Exécuter le script avec variables d'environnement

**Option A : Variables d'environnement inline**

```bash
ADMIN_EMAIL="super-admin@klozd.app" \
ADMIN_PASSWORD="VotreMotDePasseSecurise123!" \
ADMIN_FIRST_NAME="Super" \
ADMIN_LAST_NAME="Admin" \
pnpm tsx scripts/create-super-admin.ts
```

**Option B : Variables d'environnement déjà définies dans Render**

Si vous avez déjà défini `ADMIN_EMAIL`, `ADMIN_PASSWORD`, etc. dans les **Environment Variables** du service Render, vous pouvez simplement exécuter :

```bash
pnpm tsx scripts/create-super-admin.ts
```

**Option C : Utiliser ts-node (si tsx n'est pas disponible) - RECOMMANDÉ SUR RENDER**

```bash
ADMIN_EMAIL="super-admin@klozd.app" \
ADMIN_PASSWORD="VotreMotDePasseSecurise123!" \
ADMIN_FIRST_NAME="Super" \
ADMIN_LAST_NAME="Admin" \
npx ts-node -r tsconfig-paths/register scripts/create-super-admin.ts
```

**Option D : Utiliser pnpm exec ts-node**

```bash
ADMIN_EMAIL="super-admin@klozd.app" \
ADMIN_PASSWORD="VotreMotDePasseSecurise123!" \
ADMIN_FIRST_NAME="Super" \
ADMIN_LAST_NAME="Admin" \
pnpm exec ts-node -r tsconfig-paths/register scripts/create-super-admin.ts
```

### 5. Vérifier la création

Le script affichera :
```
✅ SUPER_ADMIN créé avec succès !
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: super-admin@klozd.app
🔑 Mot de passe: VotreMotDePasseSecurise123!
👤 Nom: Super Admin
🔐 Rôle: SUPER_ADMIN
🆔 ID: <uuid>
🏢 Organisation: KLOZD Internal (<uuid>)
```

---

## Méthode 2 : Via la ligne de commande interactive

Si vous préférez saisir les informations de manière interactive :

```bash
cd /opt/render/project/src/apps/api
pnpm tsx scripts/create-super-admin.ts
```

Le script vous demandera ensuite :
- Email
- Mot de passe
- Prénom
- Nom

**⚠️ Important** : Dans un shell Render, l'interaction peut être limitée. Préférez la **Méthode 1** avec variables d'environnement.

---

## Vérification via API

Après création, vous pouvez vérifier que le SUPER_ADMIN existe :

```bash
# Dans le shell Render ou depuis votre machine locale
curl -X POST https://api.klozd.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "super-admin@klozd.app",
    "password": "VotreMotDePasseSecurise123!"
  }'
```

---

## Troubleshooting

### Erreur : "Cannot find module '@prisma/client'"

```bash
# Régénérer le client Prisma
pnpm prisma generate
```

### Erreur : "Cannot connect to database"

Vérifier que `DATABASE_URL` est correctement définie dans les **Environment Variables** du service Render.

### Erreur : "tsx: command not found"

Utiliser `npx tsx` ou `ts-node` :

```bash
npx tsx scripts/create-super-admin.ts
# ou
npx ts-node -r tsconfig-paths/register scripts/create-super-admin.ts
```

### Le script demande des inputs mais vous ne pouvez pas répondre

Utiliser les variables d'environnement (Méthode 1) au lieu de l'interaction.

---

## Configuration Render recommandée

Pour faciliter les futures créations, ajouter ces variables dans **Settings → Environment Variables** :

```
ADMIN_EMAIL=super-admin@klozd.app
ADMIN_PASSWORD=<mot-de-passe-securise>
ADMIN_FIRST_NAME=Super
ADMIN_LAST_NAME=Admin
```

Ensuite, exécuter simplement :
```bash
pnpm tsx scripts/create-super-admin.ts
```