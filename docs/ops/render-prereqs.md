# Déploiement sur Render - Prérequis

Ce document décrit comment déployer l'API KLOZD sur Render avec deux processus séparés : un Web Service (API) et un Background Worker.

---

## 📋 Architecture Render

Render nécessite deux services distincts :

1. **Web Service** : API HTTP qui écoute sur `0.0.0.0:PORT`
   - Exécute le serveur NestJS
   - Désactive les crons (`RUN_SCHEDULER=false` ou non défini)
   - Gère les requêtes HTTP

2. **Background Worker** : Processus séparé pour les tâches asynchrones
   - Pas de serveur HTTP
   - Active les crons (`RUN_SCHEDULER=true`)
   - Traite les jobs BullMQ
   - Exécute les tâches planifiées

---

## 🚀 Configuration Render

### Service 1 : Web Service (API)

**Type** : Web Service

**Build Command** :
```bash
cd apps/api && pnpm install && pnpm build
```

**Start Command** :
```bash
cd apps/api && pnpm start:prod
```

**Environment Variables** (voir section ci-dessous)

**Important** : Ne PAS définir `RUN_WORKER=true` dans le Web Service (défaut: `false`)
- `RUN_WORKER` : Non défini ou `false` (BullMQ processors ne démarreront pas)
- ⚠️ **Note** : Tous les processeurs BullMQ sont désactivés sauf si `RUN_WORKER=true`

**Port** : Render définit automatiquement `PORT`, l'API l'utilise

**Health Check Path** : `/health`

---

### Service 2 : Background Worker

**Type** : Background Worker

**Build Command** :
```bash
cd apps/api && pnpm install && pnpm build
```

**Start Command** :
```bash
cd apps/api && RUN_WORKER=true RUN_SCHEDULER=true pnpm start:worker
```

**Environment Variables** : Identiques au Web Service (voir section ci-dessous)

⚠️ **Important** : Le worker DOIT avoir :
- `RUN_WORKER=true` : Active les processeurs BullMQ (obligatoire)
- `RUN_SCHEDULER=true` : Active les crons (obligatoire)

---

## 🔧 Variables d'Environnement Requises

Toutes ces variables doivent être définies pour les deux services (Web Service + Worker) :

### Base de Données
- `DATABASE_URL` : Connection string PostgreSQL (ex: `postgresql://user:password@host:5432/dbname`)

### Cache et Queue
- `REDIS_URL` : Connection string Redis (ex: `redis://user:password@host:6379`)

### Authentification
- `JWT_SECRET` : Secret pour signer les tokens JWT (minimum 32 caractères)
- `JWT_EXPIRES_IN` : Expiration des access tokens (défaut: `15m`)
- `REFRESH_TOKEN_EXPIRES_IN` : Expiration des refresh tokens (défaut: `7d`)

### URLs et CORS
- `FRONTEND_URL` : URL de l'application web (ex: `https://my.klozd.com`)
- `CORS_ORIGINS` : Origines CORS autorisées, séparées par des virgules (ex: `https://my.klozd.com,https://klozd.com`)
- `API_BASE_URL` : URL publique de l'API (ex: `https://api.klozd.com`)
- `COOKIE_DOMAIN` : Domaine pour les cookies (production: `.klozd.com`, dev: `undefined`)

### Reverse Proxy
- `TRUST_PROXY` : `true` en production (pour détecter l'IP client derrière LoadBalancer)

### Emails
- `EMAIL_FROM` : Adresse email d'envoi (ex: `noreply@klozd.com`)
- `RESEND_API_KEY` : Clé API Resend (optionnel, si non configuré les emails ne seront pas envoyés)

### SMS/WhatsApp (optionnel)
- `TWILIO_ACCOUNT_SID` : Twilio Account SID
- `TWILIO_AUTH_TOKEN` : Twilio Auth Token

### Monitoring
- `SENTRY_DSN` : DSN Sentry pour le monitoring (optionnel)

### Autres
- `NODE_ENV` : `production` en production
- `LOG_LEVEL` : Niveau de log (défaut: `info`)
- `LOG_PRETTY` : `false` en production (logs JSON structurés)

### Spécifique au Worker
- `RUN_WORKER` : **`true`** uniquement pour le Background Worker (DOIT être défini pour activer les processeurs BullMQ)
- `RUN_SCHEDULER` : **`true`** uniquement pour le Background Worker (DOIT être défini pour activer les crons)

---

## 📝 Commandes Locales (Simulation Render)

### 1. Build
```bash
pnpm --filter api build
```

### 2. Démarrer l'API (Web Service)
```bash
# Simuler Render Web Service
PORT=10000 pnpm --filter api start:prod
```

L'API écoutera sur `http://0.0.0.0:10000`. Les processeurs BullMQ et les crons seront désactivés par défaut.

### 3. Démarrer le Worker
```bash
# Simuler Render Background Worker
RUN_WORKER=true RUN_SCHEDULER=true pnpm --filter api start:worker
```

Le worker démarrera les processeurs BullMQ et activera les crons.

### 4. Migrations Prisma
```bash
# Avant le premier déploiement ou après une migration
DATABASE_URL=postgresql://... pnpm --filter api prisma:migrate:deploy
```

⚠️ **Important** : Les migrations doivent être exécutées AVANT le premier déploiement du Web Service.

---

## ✅ Checklist Déploiement

### Avant le premier déploiement

- [ ] Créer la base de données PostgreSQL sur Render (ou externe)
- [ ] Créer Redis sur Render (ou externe)
- [ ] Configurer toutes les variables d'environnement nécessaires
- [ ] Exécuter les migrations Prisma (`prisma:migrate:deploy`)
- [ ] Vérifier que `DATABASE_URL` et `REDIS_URL` sont corrects

### Configuration Web Service

- [ ] Type : **Web Service**
- [ ] Build Command : `cd apps/api && pnpm install && pnpm build`
- [ ] Start Command : `cd apps/api && pnpm start:prod`
- [ ] Health Check Path : `/health`
- [ ] Toutes les variables d'environnement définies
- [ ] `RUN_WORKER` : **Non défini** ou `false` (processeurs BullMQ désactivés)
- [ ] `RUN_SCHEDULER` : **Non défini** ou `false` (crons désactivés)

### Configuration Background Worker

- [ ] Type : **Background Worker**
- [ ] Build Command : `cd apps/api && pnpm install && pnpm build`
- [ ] Start Command : `cd apps/api && RUN_WORKER=true RUN_SCHEDULER=true pnpm start:worker`
- [ ] Toutes les variables d'environnement définies (identique au Web Service)
- [ ] `RUN_WORKER` : **`true`** (processeurs BullMQ activés)
- [ ] `RUN_SCHEDULER` : **`true`** (crons activés)

### Vérifications Post-Déploiement

- [ ] Health check `/health` répond `200 OK`
- [ ] Les logs du Web Service montrent "Scheduler: DISABLED"
- [ ] Les logs du Worker montrent "Scheduler: ENABLED"
- [ ] Les crons s'exécutent dans le Worker (vérifier les logs)
- [ ] Les jobs BullMQ sont traités (vérifier les logs)

---

## 🔍 Debugging

### Vérifier que l'API écoute sur le bon host/port

Les logs au démarrage doivent montrer :
```
🚀 API KLOZD is running on http://0.0.0.0:XXXX
👷 Worker: DISABLED (BullMQ processors will NOT run)
⏰ Scheduler: DISABLED (cron jobs will NOT run)
```

### Vérifier que le Worker démarre correctement

Les logs du Worker doivent montrer :
```
🚀 Starting KLOZD Worker process...
👷 Worker: ENABLED
⏰ Scheduler: ENABLED
✅ Application context initialized
✅ BullMQ processors should auto-start via OnModuleInit hooks
✅ Cron jobs enabled and ready to run
✅ Worker is running and ready to process background jobs
```

### Vérifier que les crons s'exécutent

Dans les logs du Worker, vous devriez voir les messages des jobs cron :
- `handleAppointmentConfirmations`
- `handleDayBeforeReminders`
- `handleHourBeforeReminders`
- `handleNoShowDetection`
- etc.

Si vous ne voyez pas ces messages, vérifiez que `RUN_SCHEDULER=true` est bien défini.

---

## 📚 Commandes Utiles

### Build local
```bash
pnpm --filter api build
```

### Test API local
```bash
PORT=3001 pnpm --filter api start:prod
```

### Test Worker local
```bash
RUN_WORKER=true RUN_SCHEDULER=true pnpm --filter api start:worker
```

### Migrations
```bash
# Développement (crée une migration)
pnpm --filter api prisma:migrate

# Production (applique les migrations existantes)
pnpm --filter api prisma:migrate:deploy
```

---

## 🚨 Troubleshooting

### Les crons ne s'exécutent pas

- Vérifiez que `RUN_SCHEDULER=true` est défini dans le Worker
- Vérifiez les logs du Worker pour voir si les méthodes cron sont appelées
- Les crons sont désactivés dans le Web Service (c'est normal)

### Les processeurs BullMQ ne démarrent pas

- Vérifiez que `RUN_WORKER=true` est défini dans le Worker
- Vérifiez les logs du Worker pour voir "BullMQ processors should auto-start"
- Les processeurs BullMQ sont désactivés dans le Web Service (c'est normal)
- Si vous voyez "BullMQ processor disabled (RUN_WORKER !== true)", le processeur a détecté qu'il ne doit pas démarrer

### L'API ne démarre pas

- Vérifiez que `PORT` est défini (Render le définit automatiquement)
- Vérifiez que `DATABASE_URL` est correct
- Vérifiez les logs pour les erreurs de connexion

### Les jobs BullMQ ne sont pas traités

- Vérifiez que Redis est accessible (`REDIS_URL` correct)
- Vérifiez que le Worker est démarré
- Vérifiez les logs du `NotificationsProcessor` dans le Worker

### Health check échoue

- Vérifiez que `/health` est accessible (pas de protection JWT)
- Vérifiez que la base de données est accessible
- Vérifiez les logs pour les erreurs de connexion

---

**Fin du document**
