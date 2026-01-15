# 📊 RÉSUMÉ TECHNIQUE COMPLET - KLOZD SaaS

## 🏗️ ARCHITECTURE GÉNÉRALE

### Stack Technique
- **Backend**: NestJS 11 (TypeScript)
- **Frontend**: Next.js 16 (React 19, App Router)
- **Base de données**: PostgreSQL + Prisma ORM
- **Cache/Queue**: Redis + BullMQ
- **Authentification**: JWT (Passport.js)
- **Documentation API**: Swagger/OpenAPI
- **Monitoring**: Sentry
- **Logging**: Pino
- **Styling**: Tailwind CSS 4

### Structure Monorepo
```
klozd/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/           # Frontend Next.js
├── package.json       # Workspace root
└── pnpm-workspace.yaml
```

---

## 🔐 SÉCURITÉ & AUTHENTIFICATION

### Backend
- ✅ **JWT Authentication** (Passport.js)
  - Token expiration configurable (défaut: 7 jours)
  - Validation automatique via `JwtAuthGuard`
  - Endpoints publics via `@Public()` decorator

- ✅ **Système de Permissions** (RBAC)
  - 5 rôles: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `CLOSER`, `SETTER`
  - Permissions granulaires par ressource
  - `RolesGuard` avec vérification automatique
  - Décorateur `@RequirePermissions()`

- ✅ **Protection contre les attaques**
  - Helmet.js (headers de sécurité)
  - Rate limiting (Throttler: 100 req/min global, exempt pour auth)
  - Protection brute-force (BruteForceService)
  - Validation des entrées (class-validator)
  - CORS configuré (origin + credentials)

- ✅ **Gestion des erreurs**
  - `HttpExceptionFilter` global
  - Logging structuré (Pino)
  - Envoi automatique à Sentry (erreurs 500+)
  - Request ID pour traçabilité

### Frontend
- ✅ **Gestion d'état auth** (Zustand)
  - Token stocké dans `localStorage`
  - Refresh automatique
  - Redirection automatique si non authentifié
  - Middleware Next.js pour protection des routes

---

## 📄 PAGES FRONTEND (31 pages)

### 🔑 Authentification (4 pages)
1. **`/login`** - Connexion
   - Email + password
   - Gestion erreurs (401, 403, quota)
   - Redirection après login

2. **`/register`** - Inscription
   - Création compte + organisation
   - Validation email

3. **`/verify-email`** - Vérification email
   - Code à 6 chiffres
   - Expiration du code

4. **`/invite/[token]`** - Acceptation invitation
   - Validation token
   - Création compte lié à l'organisation

### 📊 Dashboard & Analytics (2 pages)
5. **`/dashboard`** - Tableau de bord principal
   - Métriques globales (leads, deals, revenus)
   - Graphiques (Recharts)
   - Filtres par période
   - Vue par rôle (Admin/Manager/Closer/Setter)

6. **`/forms/[id]/analytics`** - Analytics formulaire
   - Vues, soumissions, abandons
   - Taux de complétion
   - Champs problématiques
   - Export CSV

### 📝 Formulaires (5 pages)
7. **`/forms`** - Liste formulaires
   - Grid de cartes
   - Filtres par statut
   - Pagination cursor-based
   - Création rapide

8. **`/forms/new`** - Création formulaire
   - Sélection template (10 templates)
   - Création depuis template ou vide
   - Redirection vers éditeur

9. **`/forms/[id]`** - Détails formulaire
   - Informations générales
   - Statut (DRAFT/ACTIVE/PAUSED/ARCHIVED)
   - Aperçu public
   - Actions (Publier, Pauser, Archiver)

10. **`/forms/[id]/edit`** - Éditeur formulaire
    - 3 panneaux: Liste champs, Éditeur, Aperçu live
    - Drag & Drop (dnd-kit)
    - Types: TEXT, EMAIL, PHONE, SELECT, RADIO, CHECKBOX, BUDGET, RATING, DATE, TEXTAREA
    - Règles conditionnelles (IF/THEN/ELSE) avec éditeur visuel
    - Tracking pixels (Meta, Google Analytics)
    - Autosave avec debounce
    - Détection changements non publiés
    - Preview avec endpoint `/forms/public/:slug/evaluate`

11. **`/pages/public/[slug]`** - Formulaire public
    - Rendu dynamique depuis snapshot
    - Validation en temps réel
    - Soumission avec idempotency-key
    - Tracking pixels
    - Capture abandons (1 min inactivité)

### 🌐 Sites Web / Landing Pages (5 pages)
12. **`/pages`** - Liste pages (Sites + Formulaires)
    - Tabs: "Sites web" et "Formulaires"
    - Grid de cartes
    - Filtres par statut

13. **`/pages/new`** - Création site
    - Nom, slug, description
    - Sélection formulaire intégré
    - SEO (meta title/description)

14. **`/pages/[id]`** - Détails site
    - Informations générales
    - Statut
    - Aperçu public
    - Analytics

15. **`/pages/[id]/edit`** - Édition site
    - Éditeur JSON pour contenu
    - Configuration SEO
    - Formulaire intégré

16. **`/sites`** - Redirection vers `/pages?tab=sites`

### 👥 Leads & CRM (3 pages)
17. **`/leads`** - Liste leads
    - Pagination cursor-based
    - Filtres (statut, source, assigné)
    - Tri (date, score, probabilité)
    - Recherche
    - "Charger plus" fonctionnel

18. **`/leads/[id]`** - Détails lead
    - Informations complètes
    - Historique (appointments, deals, notes)
    - Score de qualification
    - Probabilité de closing (IA)
    - Actions (assigner, qualifier, disqualifier)

19. **`/crm/deals/[id]`** - Détails deal
    - Informations deal
    - Pipeline stage
    - Historique négociation

### 📅 Scheduling / Calendrier (3 pages)
20. **`/scheduling`** - Gestion rendez-vous
    - Liste appointments (table)
    - Filtres (statut, closer, date)
    - Actions (modifier, annuler, marquer no-show)
    - Configuration calendrier intégrée

21. **`/settings/calendar`** - Configuration calendrier
    - Paramètres (durée, buffers)
    - Disponibilités (jours/heures)
    - Attribution closers (Round Robin, IA, Manuelle)
    - **Séquence automatique confirmations** (timeline complète):
      - T+0: Email confirmation + ICS + visio link
      - T+10min: WhatsApp closer
      - J-1: Email rappel + boutons action
      - H-1: Email + SMS rappel
      - T-0: Notification closer
      - T+15min: Détection no-show
    - Aperçu calendrier réaliste

22. **`/book/[leadId]`** - Réservation publique
    - Sélection date/heure
    - Affichage closer (nom + pseudonyme)
    - Créneaux disponibles
    - Confirmation avec WhatsApp au closer
    - Blocage si lead blacklisté

### 📞 Appels / Visioconférence (1 page)
23. **`/app/call/[appointmentId]`** - Appel en cours
    - Intégration LiveKit
    - Audio/Video
    - Enregistrement (optionnel)

### ⚙️ Paramètres & Administration (4 pages)
24. **`/settings`** - Paramètres généraux
    - Profil utilisateur
    - Préférences

25. **`/users`** - Gestion utilisateurs
    - Liste utilisateurs
    - Création/Modification
    - Attribution rôles
    - Activation/Désactivation

26. **`/organizations`** - Gestion organisations
    - Liste organisations
    - Création/Modification
    - Paramètres organisation

27. **`/pages/[id]/analytics`** - Analytics site
    - Métriques site
    - Graphiques

### 🏠 Pages publiques (1 page)
28. **`/`** - Landing page publique
    - Page d'accueil

---

## 🔌 ENDPOINTS BACKEND (19 controllers, ~108 endpoints)

### Auth (`/auth`)
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/logout` - Déconnexion
- `POST /auth/refresh` - Refresh token
- `POST /auth/verify-email` - Vérification email
- `POST /auth/forgot-password` - Mot de passe oublié
- `POST /auth/reset-password` - Réinitialisation

### Forms (`/forms`)
- `GET /forms` - Liste (paginée)
- `POST /forms` - Création
- `GET /forms/:id` - Détails
- `PATCH /forms/:id` - Modification
- `DELETE /forms/:id` - Suppression
- `POST /forms/:id/publish` - Publication
- `GET /forms/public/:slug` - Formulaire public (snapshot)
- `POST /forms/public/:slug/evaluate` - Évaluation règles conditionnelles
- `GET /forms/:id/analytics` - Analytics

### Leads (`/leads`)
- `GET /leads` - Liste (paginée, filtres)
- `GET /leads/:id` - Détails
- `PATCH /leads/:id` - Modification
- `POST /leads/forms/:formId/submit` - Soumission formulaire public
- `POST /leads/:id/qualify` - Qualification
- `POST /leads/:id/disqualify` - Disqualification
- `POST /leads/:id/assign` - Attribution closer/setter

### Scheduling (`/scheduling`)
- `GET /scheduling/appointments` - Liste appointments
- `POST /scheduling/appointments` - Création (admin)
- `POST /scheduling/appointments/public` - Création publique
- `GET /scheduling/appointments/:id` - Détails
- `PATCH /scheduling/appointments/:id` - Modification
- `POST /scheduling/appointments/:id/no-show` - Marquer no-show
- `GET /scheduling/availability/:closerId` - Disponibilités closer
- `GET /scheduling/appointments/:id/calendar.ics` - Téléchargement ICS
- `POST /scheduling/appointments/:id/whatsapp-closer` - WhatsApp closer

### Calendar Config (`/calendar-config`)
- `GET /calendar-config` - Configuration
- `PUT /calendar-config` - Mise à jour

### CRM (`/crm`)
- `GET /crm/deals` - Liste deals
- `POST /crm/deals` - Création deal
- `GET /crm/deals/:id` - Détails
- `PATCH /crm/deals/:id` - Modification
- `POST /crm/deals/:id/close` - Clôture deal

### Dashboard (`/dashboard`)
- `GET /dashboard` - Métriques globales
- `GET /dashboard/analytics` - Analytics détaillées

### Sites (`/sites`)
- `GET /sites` - Liste
- `POST /sites` - Création
- `GET /sites/:id` - Détails
- `PATCH /sites/:id` - Modification
- `DELETE /sites/:id` - Suppression

### Users (`/users`)
- `GET /users` - Liste
- `POST /users` - Création
- `GET /users/:id` - Détails
- `PATCH /users/:id` - Modification
- `DELETE /users/:id` - Suppression

### Organizations (`/organizations`)
- `GET /organizations` - Liste
- `POST /organizations` - Création
- `GET /organizations/:id` - Détails
- `PATCH /organizations/:id` - Modification

### Notifications (`/notifications`)
- `GET /notifications` - Liste (paginée)
- `PATCH /notifications/:id/read` - Marquer lu
- `DELETE /notifications/:id` - Suppression

### Exports (`/exports`)
- `GET /exports/leads/csv` - Export leads CSV
- `GET /exports/forms/:id/csv` - Export formulaire CSV

### AI (`/ai`)
- `POST /ai/predict-closing` - Prédiction closing
- `POST /ai/analyze-sentiment` - Analyse sentiment

### Calls (`/calls`)
- `POST /calls/start` - Démarrer appel
- `GET /calls/:id` - Détails appel
- `POST /calls/:id/end` - Terminer appel

### Health (`/health`)
- `GET /health` - Health check

### Admin (`/admin`)
- `GET /admin/jobs` - Liste jobs queue
- `POST /admin/jobs/:id/retry` - Relancer job

---

## 🔄 CRON JOBS & TÂCHES AUTOMATIQUES

### Scheduling Tasks (`SchedulingTasksService`)
1. **`handleAppointmentConfirmations`** (Toutes les heures)
   - Envoie confirmations T+0 pour appointments créés < 1h

2. **`handleWhatsAppT10Reminders`** (Toutes les 15 min)
   - Envoie WhatsApp T+10min après réservation

3. **`handleDayBeforeReminders`** (Toutes les heures)
   - Envoie rappels J-1 (24h avant)

4. **`handleHourBeforeReminders`** (Toutes les 15 min)
   - Envoie rappels H-1 (1h avant) + SMS si activé

5. **`handleT0Notifications`** (Toutes les 15 min)
   - Notification closer à l'heure du RDV

6. **`handleNoShowDetection`** (Toutes les 15 min)
   - Détecte no-shows (15min après début, pas de call)

7. **`handleNoShowRecoveryEmails`** (Tous les jours 9h)
   - Envoie emails J+2 pour no-shows d'il y a 2 jours

8. **`handleNoShowRateNotification`** (Tous les lundis 9h)
   - Notification admin avec taux no-show hebdomadaire

### Leads Tasks (`LeadsTasksService`)
- **`handleAbandonRecovery`** (Toutes les heures)
  - Séquence de relance pour abandons formulaires
  - 3 emails max sur 7 jours
  - Taux de récupération visé: 15-20%

---

## 🗄️ MODÈLES DE DONNÉES (Prisma)

### Core Models
- **Organization** - Organisations (multi-tenant)
- **User** - Utilisateurs (5 rôles)
- **Invitation** - Invitations équipe

### Forms & Leads
- **Form** - Formulaires (DRAFT/ACTIVE/PAUSED/ARCHIVED)
- **FormField** - Champs formulaire
- **FormVersion** - Snapshots publiés
- **FormSubmission** - Soumissions
- **FormAbandon** - Abandons (capture + récupération)
- **Lead** - Leads (NEW/QUALIFIED/DISQUALIFIED/APPOINTMENT_SCHEDULED/etc.)
- **LeadSource** - Source (FORM/MANUAL/IMPORT/ABANDON_RECOVERY)

### Scheduling
- **Appointment** - Rendez-vous (SCHEDULED/CONFIRMED/COMPLETED/NO_SHOW/CANCELLED)
- **CalendarConfig** - Configuration calendrier
- **CloserSettings** - Paramètres closer (disponibilités, pseudonyme)

### CRM
- **Deal** - Deals (pipeline)
- **Call** - Appels visioconférence
- **CallParticipant** - Participants appel

### Sites
- **Site** - Sites web / Landing pages

### Notifications
- **Notification** - Notifications in-app

### Settings
- **OrganizationSettings** - Paramètres organisation (quota leads, etc.)

---

## 🔗 INTÉGRATIONS EXTERNES

### Email
- ✅ **Resend** (prioritaire)
- ✅ **SendGrid** (fallback)
- Templates HTML personnalisés

### SMS
- ✅ **Twilio**
- Coût: +0.05€/SMS

### WhatsApp
- ✅ **Twilio WhatsApp API**
- Messages automatiques (confirmations, rappels)

### Visioconférence
- ✅ **LiveKit** (intégré)
- ✅ **Zoom** (via SDK)
- ✅ **Google Meet** (via API)
- ✅ **Daily.co** (mentionné, non implémenté)
- ✅ **Lien externe** (custom)

### Analytics & Tracking
- ✅ **Meta Pixel** (Facebook)
- ✅ **Google Analytics**
- ✅ **Google Tag Manager**

### IA
- ✅ **OpenAI** (GPT-4o-mini)
  - Prédiction probabilité closing
  - Analyse sentiment
- Fallback modèle simple si pas de clé API

### Queue & Cache
- ✅ **Redis** (via ioredis)
- ✅ **BullMQ** (queue jobs)
  - Notifications (email, SMS, WhatsApp)
  - Jobs asynchrones

### Monitoring
- ✅ **Sentry** (erreurs + performance)
- ✅ **Pino** (logging structuré)

---

## 🎯 FONCTIONNALITÉS CLÉS

### 1. Form Builder
- ✅ Drag & Drop interface
- ✅ 10 types de champs
- ✅ Règles conditionnelles (IF/THEN/ELSE) avec éditeur visuel
- ✅ Scoring automatique
- ✅ Qualification automatique
- ✅ Templates (10 prédéfinis)
- ✅ Tracking pixels
- ✅ Capture abandons (1 min inactivité)
- ✅ Séquence récupération (3 emails / 7 jours)

### 2. Lead Management
- ✅ Scoring automatique (0-100)
- ✅ Qualification automatique (règles)
- ✅ Attribution automatique (Round Robin, IA, Manuelle)
- ✅ Prédiction closing (IA)
- ✅ Historique complet
- ✅ Pagination cursor-based

### 3. Scheduling
- ✅ Gestion disponibilités
- ✅ Attribution automatique closers
- ✅ Séquence confirmations complète (T+0, T+10min, J-1, H-1, T-0, T+15min)
- ✅ Génération ICS
- ✅ Détection no-shows
- ✅ Relance no-shows (J+0, J+2)
- ✅ Blacklist automatique (2 no-shows)
- ✅ Blocage réservation si blacklisté

### 4. CRM
- ✅ Pipeline deals
- ✅ Stages personnalisables
- ✅ Probabilité closing
- ✅ Valeur prédite

### 5. Analytics
- ✅ Dashboard global
- ✅ Analytics formulaires
- ✅ Analytics sites
- ✅ Export CSV

### 6. Multi-tenant
- ✅ Isolation par organisation
- ✅ Quotas par organisation
- ✅ Settings par organisation

---

## ⚠️ POINTS CRITIQUES À VÉRIFIER

### 🔴 Sécurité
- [ ] **JWT Secret** - Vérifier que `JWT_SECRET` est fort et unique en production
- [ ] **CORS** - Vérifier `FRONTEND_URL` en production
- [ ] **Rate Limiting** - Tester limites (100 req/min)
- [ ] **SQL Injection** - Prisma protège, mais vérifier requêtes raw
- [ ] **XSS** - Vérifier sanitization inputs (surtout JSON fields)
- [ ] **CSRF** - Pas de protection CSRF explicite (à ajouter si nécessaire)

### 🟡 Performance
- [ ] **Pagination** - Tous les endpoints listes utilisent cursor-based (✅)
- [ ] **Indexes DB** - Vérifier indexes Prisma (présents dans schema ✅)
- [ ] **Cache Redis** - Utilisé pour queue, pas pour cache API (à considérer)
- [ ] **N+1 Queries** - Vérifier `include` Prisma (présents ✅)
- [ ] **File Uploads** - Pas de gestion upload fichiers (si nécessaire)

### 🟢 Fiabilité
- [ ] **Error Handling** - Global filter présent (✅)
- [ ] **Idempotency** - Clé `Idempotency-Key` pour soumissions (✅)
- [ ] **Queue Jobs** - BullMQ avec retry (✅)
- [ ] **Database Transactions** - Vérifier transactions critiques
- [ ] **Rollback Migrations** - Tester rollback Prisma

### 🔵 Scalabilité
- [ ] **Horizontal Scaling** - API stateless (✅), vérifier Redis partagé
- [ ] **Database Connections** - Pool Prisma configuré
- [ ] **Cron Jobs** - Vérifier pas de doublons en multi-instance
- [ ] **File Storage** - Pas de storage fichiers (si nécessaire, utiliser S3)

### 🟣 Monitoring & Observabilité
- [ ] **Sentry** - Configuré (✅), vérifier alerts
- [ ] **Logging** - Pino structuré (✅)
- [ ] **Health Checks** - Endpoint `/health` (✅)
- [ ] **Metrics** - Pas de métriques custom (à considérer Prometheus)

### 🟠 Tests
- [ ] **E2E Tests** - Présents (`test:e2e:local`) (✅)
- [ ] **Unit Tests** - Partiels (quelques `.spec.ts`)
- [ ] **Integration Tests** - Partiels
- [ ] **Coverage** - Vérifier coverage actuel

### 🔶 Intégrations
- [ ] **Email Providers** - Resend/SendGrid configurés (✅)
- [ ] **SMS** - Twilio configuré (✅)
- [ ] **WhatsApp** - Twilio configuré (✅)
- [ ] **Visioconférence** - LiveKit configuré (✅)
- [ ] **OpenAI** - Fallback si pas de clé (✅)
- [ ] **Redis** - Nécessaire pour queue (⚠️)

### 🟥 Données & Backup
- [ ] **Backup Database** - Pas de stratégie automatique
- [ ] **Data Retention** - Pas de politique de rétention
- [ ] **GDPR** - Pas de gestion suppression données
- [ ] **Export Data** - CSV présent (✅)

---

## 📋 CHECKLIST DÉPLOIEMENT PRODUCTION

### Environnement
- [ ] Variables d'environnement configurées
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` fort et unique
- [ ] `DATABASE_URL` production
- [ ] `REDIS_URL` production
- [ ] `FRONTEND_URL` production
- [ ] `API_URL` production

### Services Externes
- [ ] Resend API key
- [ ] Twilio credentials
- [ ] OpenAI API key (optionnel)
- [ ] Sentry DSN
- [ ] Meta Pixel ID (optionnel)
- [ ] Google Analytics ID (optionnel)

### Infrastructure
- [ ] PostgreSQL production (backup configuré)
- [ ] Redis production (persistence configuré)
- [ ] Domaines configurés (API + Frontend)
- [ ] SSL/TLS certificats
- [ ] CDN (si nécessaire)

### Monitoring
- [ ] Sentry alerts configurés
- [ ] Health checks monitoring
- [ ] Logs centralisés
- [ ] Uptime monitoring

### Sécurité
- [ ] Firewall configuré
- [ ] Rate limiting production
- [ ] CORS production
- [ ] Headers sécurité (Helmet ✅)

---

## 📊 STATISTIQUES CODEBASE

- **Backend Controllers**: 19
- **Backend Endpoints**: ~108
- **Frontend Pages**: 31
- **Cron Jobs**: 8
- **Models Prisma**: 15+
- **Intégrations**: 8 (Email, SMS, WhatsApp, Visio x4, IA, Analytics x3)

---

## ✅ POINTS FORTS

1. **Architecture solide** - NestJS + Next.js, séparation claire
2. **Sécurité** - JWT, RBAC, rate limiting, validation
3. **Multi-tenant** - Isolation par organisation
4. **Scalabilité** - Cursor pagination, queue jobs, stateless API
5. **Observabilité** - Sentry, Pino, health checks
6. **Documentation** - Swagger/OpenAPI
7. **Tests** - E2E tests présents
8. **Intégrations** - Nombreuses intégrations externes

## ⚠️ POINTS D'ATTENTION

1. **Tests** - Coverage partiel, augmenter unit tests
2. **Backup** - Pas de stratégie automatique
3. **GDPR** - Gestion données personnelles à renforcer
4. **Cache API** - Pas de cache Redis pour API (queue seulement)
5. **File Storage** - Pas de gestion upload fichiers
6. **CSRF** - Protection CSRF à considérer
7. **Metrics** - Pas de métriques custom (Prometheus)

---

**Date**: 2025-01-27
**Version**: 1.0.0
