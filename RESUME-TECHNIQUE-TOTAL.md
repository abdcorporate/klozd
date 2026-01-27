# 📊 RÉSUMÉ TECHNIQUE TOTAL - KLOZD SaaS

**Date de mise à jour** : Janvier 2026  
**Version** : 1.0.0

---

## 🏗️ ARCHITECTURE GÉNÉRALE

### Stack Technique

**Backend** :
- **Framework** : NestJS 11 (TypeScript)
- **Base de données** : PostgreSQL + Prisma ORM 6.1.0
- **Cache/Queue** : Redis + BullMQ
- **Authentification** : JWT (Passport.js) + Refresh Tokens (HttpOnly Cookies)
- **Documentation API** : Swagger/OpenAPI
- **Monitoring** : Sentry
- **Logging** : Pino (structured logging)
- **Sécurité** : Helmet, CORS, Rate Limiting, CSRF Protection

**Frontend** :
- **Framework** : Next.js 16.1+ (App Router)
- **React** : 19.2.3
- **Styling** : Tailwind CSS 4
- **State Management** : Zustand
- **HTTP Client** : Axios avec interceptors
- **Form Validation** : React Hook Form + Zod

**Marketing** :
- **Framework** : Next.js 16.1+ (App Router)
- **React** : 19.2.3
- **Styling** : Tailwind CSS 4
- **Fonts** : Inter (Google Fonts)

### Structure Monorepo

```
klozd/
├── apps/
│   ├── api/              # Backend NestJS (Port 3001)
│   ├── web/              # Frontend Next.js App (Port 3000)
│   └── marketing/        # Landing Page Next.js (Port 3002)
├── docs/
│   └── ops/              # Documentation opérationnelle
├── package.json          # Workspace root
└── pnpm-workspace.yaml   # Configuration pnpm
```

**Gestion des dépendances** : pnpm 10.26.1 avec workspaces

---

## 🔐 SÉCURITÉ & AUTHENTIFICATION

### Système d'Authentification

**Architecture** :
- ✅ **Access Token JWT** : Court (15 minutes), stocké en mémoire côté frontend
- ✅ **Refresh Token** : Long (7-30 jours), stocké en cookie HttpOnly Secure SameSite=Lax
- ✅ **Rotation automatique** : Le refresh token est invalidé et remplacé à chaque refresh
- ✅ **Hashing** : Refresh tokens hashés avec bcrypt en base de données
- ✅ **Révocation** : Logout invalide le refresh token côté serveur

**Endpoints** :
- `POST /auth/login` : Retourne access token + set-cookie refresh token
- `POST /auth/refresh` : Lit cookie, rotate token, retourne nouveau access token
- `POST /auth/logout` : Clear cookie + invalide refresh token
- `GET /auth/me` : Vérifie l'authentification actuelle
- `GET /auth/csrf` : Génère un token CSRF (double-submit pattern)

**Protection CSRF** :
- ✅ Double-submit token pour `/auth/refresh` et `/auth/logout`
- ✅ Token CSRF dans cookie non-HttpOnly + header `X-CSRF-Token`
- ✅ Validation avec `timingSafeEqual` pour éviter les timing attacks

### Système de Rôles et Permissions (RBAC)

**Rôles disponibles** :
- `SUPER_ADMIN` : Accès complet, gestion waitlist, audit logs
- `ADMIN` : Gestion complète de l'organisation
- `MANAGER` : Gestion des équipes et leads
- `CLOSER` : Gestion des deals et closing
- `SETTER` : Qualification des leads

**Guards** :
- `JwtAuthGuard` : Vérification JWT (global, sauf `@Public()`)
- `RolesGuard` : Vérification des rôles (`@RequireRoles()`)
- `OwnershipGuard` : Vérification de propriété multi-tenant
- `CsrfGuard` : Protection CSRF pour endpoints sensibles

**Décorateurs** :
- `@Public()` : Endpoint accessible sans authentification
- `@RequireRoles(...)` : Rôles requis pour accéder
- `@RequirePermissions(...)` : Permissions granulaires requises
- `@CurrentUser()` : Injection de l'utilisateur actuel

### Protection contre les Attaques

**Backend** :
- ✅ **Helmet.js** : Headers de sécurité HTTP
- ✅ **Rate Limiting** : Throttler (100 req/min global, exempt pour auth)
- ✅ **Brute-Force Protection** : `BruteForceService` avec verrouillage temporaire
- ✅ **Validation** : class-validator sur tous les DTOs
- ✅ **CORS** : Configuration multi-origins (web + marketing)
- ✅ **Trust Proxy** : Détection IP client fiable derrière reverse proxy
- ✅ **Honeypot** : Protection anti-bot sur formulaires publics
- ✅ **Timestamp Validation** : Protection contre les soumissions automatisées

**Frontend** :
- ✅ **Middleware Next.js** : Protection des routes basée sur cookie refreshToken
- ✅ **Interceptors Axios** : Refresh automatique sur 401
- ✅ **Queue de requêtes** : Évite les refresh multiples simultanés

---

## 📦 MODULES API (NestJS)

### Modules Principaux

**Authentification** (`auth/`) :
- `AuthService` : Login, refresh, logout, vérification
- `RefreshTokenService` : Gestion du cycle de vie des refresh tokens
- `BruteForceService` : Protection contre les attaques brute-force
- `CsrfService` : Génération et validation des tokens CSRF
- `OwnershipPolicyService` : Politiques de propriété multi-tenant

**Formulaires** (`forms/`) :
- Création, édition, publication de formulaires
- Versioning avec snapshots publics
- Analytics (vues, soumissions, abandons)
- Champs conditionnels et règles de scoring

**Leads** (`leads/`) :
- Gestion du pipeline de leads
- Qualification automatique (scoring IA)
- Assignation aux closeurs
- Récupération des abandons

**CRM** (`crm/`) :
- Gestion des deals
- Pipeline de vente
- Rapports et analytics
- Prévisions IA

**Planification** (`scheduling/`) :
- Création et gestion de rendez-vous
- Intégration calendrier
- Notifications automatiques (T-10, T-1, T0)
- Détection no-show et récupération

**Notifications** (`notifications/`) :
- Multi-canaux : Email (Resend), SMS (Twilio), WhatsApp, In-app
- Templates personnalisables
- Queue BullMQ pour traitement asynchrone
- **Déduplication** : `MessageDelivery` pour garantir "no double send"

**Utilisateurs** (`users/`) :
- CRUD utilisateurs
- Gestion des rôles
- Invitations par email
- Activation/désactivation

**Organisations** (`organizations/`) :
- Multi-tenant isolation
- Settings par organisation
- Configuration calendrier

**Admin** (`admin/`) :
- Audit logs (paginé, filtrable)
- Waitlist entries (SUPER_ADMIN uniquement)
- Jobs et statistiques

**Waitlist** (`waitlist/`) :
- Endpoint public `/public/waitlist`
- Validation stricte (email, honeypot, timestamp)
- Détection d'anomalies (IP, patterns suspects)
- Sécurité renforcée (`WaitlistSecurityService`)

### Services Communs (`common/`)

**Audit Log** :
- `AuditLogService` : Enregistrement de toutes les mutations critiques
- Intégration sur : Leads, Forms, Appointments, Users, Settings

**Data Retention** :
- `DataRetentionService` : Purge automatique des données anciennes
- Cron quotidien avec verrous distribués
- Rétention configurable : FormAbandon (90j), Notifications (180j), AuditLog (365j)

**Distributed Locks** :
- `DistributedLockService` : Prévention d'exécutions multiples de crons
- Redis `SET NX EX` pour atomicité
- Fallback configurable si Redis indisponible

**IP Detection** :
- `IpDetectionService` : Détection IP client fiable
- Support `X-Forwarded-For`, `X-Real-IP`
- Normalisation IPv6
- Configurable via `TRUST_PROXY`

**Message Delivery** :
- `MessageDeliveryService` : Déduplication des messages transactionnels
- Hash canonique du payload pour détecter les doublons
- Statuts : PENDING, SENT, FAILED, CANCELLED, DELIVERED

**Public Endpoint Security** :
- `PublicEndpointSecurityService` : Rate limiting, honeypot, logging
- Protection des endpoints publics (forms, waitlist)

---

## 🗄️ BASE DE DONNÉES (Prisma)

### Modèles Principaux

**Organisations & Utilisateurs** :
- `Organization` : Organisations multi-tenant
- `User` : Utilisateurs avec rôles
- `RefreshToken` : Refresh tokens hashés
- `Invitation` : Invitations par email

**Formulaires** :
- `Form` : Formulaires de qualification
- `FormField` : Champs avec règles de scoring
- `FormSubmission` : Soumissions
- `FormAbandon` : Abandons capturés
- `FormVersion` : Versioning avec snapshots

**Leads & Pipeline** :
- `Lead` : Prospects/leads
- `Appointment` : Rendez-vous
- `Deal` : Affaires dans le pipeline
- `Activity` : Activités et follow-ups

**Notifications** :
- `Notification` : Notifications in-app
- `MessageDelivery` : Déduplication des messages
- `FailedJob` : Jobs échoués (BullMQ)

**Audit & Sécurité** :
- `AuditLog` : Logs d'audit complets
- `IdempotencyKey` : Clés d'idempotence
- `AuthAttempt` : Tentatives d'authentification

**Waitlist** :
- `WaitlistEntry` : Inscriptions à la waitlist
  - Email (unique), firstName, role (secteur), leadVolumeRange
  - UTM parameters, IP, userAgent

**IA & Analytics** :
- `AIPrediction` : Prédictions IA

### Isolation Multi-Tenant

- ✅ **TenantPrismaService** : Wrapper Prisma avec filtrage automatique par `organizationId`
- ✅ Toutes les requêtes multi-tenant utilisent ce service
- ✅ Protection contre les fuites de données entre organisations

---

## 🎨 FRONTEND (apps/web)

### Pages Principales (35 pages)

**Authentification** (4 pages) :
- `/login` : Connexion
- `/register` : Inscription
- `/verify-email` : Vérification email
- `/invite/[token]` : Acceptation invitation

**Dashboard & Analytics** (2 pages) :
- `/dashboard` : Tableau de bord principal
- `/forms/[id]/analytics` : Analytics formulaire

**Formulaires** (5 pages) :
- `/forms` : Liste formulaires
- `/forms/new` : Création formulaire
- `/forms/[id]` : Édition formulaire
- `/forms/[id]/analytics` : Analytics
- `/forms/[id]/submissions` : Soumissions

**Leads** (3 pages) :
- `/leads` : Liste leads
- `/leads/[id]` : Détail lead
- `/leads/new` : Création lead

**CRM** (2 pages) :
- `/crm` : Pipeline de vente
- `/crm/deals/[id]` : Détail deal

**Planification** (1 page) :
- `/scheduling` : Calendrier et rendez-vous

**Utilisateurs** (2 pages) :
- `/users` : Liste utilisateurs
- `/users/[id]` : Détail utilisateur

**Paramètres** (3 pages) :
- `/settings` : Paramètres généraux
- `/settings/calendar` : Configuration calendrier
- `/settings/team` : Gestion équipe

**Admin** (2 pages) :
- `/waitlist` : Gestion waitlist (SUPER_ADMIN)
- `/admin/audit-logs` : Logs d'audit (ADMIN/SUPER_ADMIN)

**Autres** :
- `/notifications` : Centre de notifications
- `/profile` : Profil utilisateur

### Composants Principaux

**Layout** :
- `AppLayout` : Layout principal avec sidebar navigation
- Navigation conditionnelle par rôle

**Formulaires** :
- Composants réutilisables pour création/édition
- Preview en temps réel
- Validation côté client

**CRM** :
- Pipeline drag & drop
- Graphiques Recharts
- Filtres avancés

**Notifications** :
- Centre de notifications
- Notifications en temps réel (polling)

---

## 🌐 MARKETING (apps/marketing)

### Pages

- `/` : Landing page premium
  - Hero, Features, How it works, Pricing, FAQ, CTA
  - Animations scroll-based
  - Design premium (KLOZD Orange #f9952a)
- `/waitlist` : Formulaire d'inscription waitlist
  - Validation Zod stricte
  - Capture UTM parameters
  - Honeypot + timestamp
- `/privacy` : Politique de confidentialité
- `/terms` : Conditions générales

### Composants Marketing

- `Header` : Navigation sticky avec scroll effect
- `HeroNew` : Section hero avec CTAs
- `ReplaceTools` : Comparaison avant/après
- `HowItWorksNew` : 3 étapes
- `FeaturesNew` : 9 fonctionnalités clés
- `ForWho` : 3 profils cibles
- `Pricing` : 3 plans (sans prix affichés)
- `FAQNew` : Accordion avec 7 questions
- `FinalCTANew` : CTA final
- `FooterNew` : Footer avec navigation
- `WaitlistForm` : Formulaire waitlist premium

### Design System

**Couleurs** :
- Primary : KLOZD Orange (#f9952a)
- Background : slate-50
- Text : Noir/Slate
- Cards : White avec border-gray-200, shadow-sm, rounded-xl

**Typography** :
- Font : Inter (Google Fonts)
- Headings : Bold, grandes tailles
- Body : Regular, lisible

**Animations** :
- `fadeInUp`, `fadeIn`, `scaleIn`, `slideInLeft`, `slideInRight`
- Délais échelonnés (delay-100 à delay-1200)
- Hover effects (scale, translate, glow)

---

## 🔄 SYSTÈMES ASYNCHRONES

### BullMQ (Queue System)

**Queues** :
- `notifications` : Envoi de messages (Email, SMS, WhatsApp)
- Jobs avec retry automatique
- Déduplication via `MessageDelivery`

**Processors** :
- `NotificationsProcessor` : Traitement des notifications
- Vérification de déduplication avant envoi
- Gestion des erreurs et retries

### Cron Jobs (NestJS Schedule)

**Scheduling Tasks** :
- `handleAppointmentConfirmations` : Confirmations T-10
- `handleDayBeforeReminders` : Rappels J-1
- `handleHourBeforeReminders` : Rappels H-1
- `handleAppointmentStartNotifications` : Notifications T0
- `handleNoShowDetection` : Détection no-show
- `handleNoShowRecoveryEmails` : Emails de récupération
- `handleNoShowRateNotification` : Notifications de taux no-show

**Leads Tasks** :
- `handleAbandonRecovery` : Récupération des abandons

**Data Retention Tasks** :
- `handleDataRetention` : Purge quotidienne des données anciennes

**Protection** :
- ✅ Tous les crons utilisent `DistributedLockService`
- ✅ Verrous Redis pour éviter les exécutions multiples
- ✅ TTL appropriés (2-10 min selon le job)
- ✅ Fallback configurable si Redis indisponible

---

## 🧪 TESTS

### Tests E2E (Backend)

**Fichiers** :
- `auth-refresh-token.e2e-spec.ts` : Refresh token rotation, logout
- `auth-csrf.e2e-spec.ts` : Protection CSRF
- `audit-log.e2e-spec.ts` : Création d'audit logs
- `message-delivery-deduplication.e2e-spec.ts` : Déduplication messages

**Configuration** :
- Jest avec configuration E2E
- Base de données de test
- Helpers pour setup/teardown

### Tests Unitaires

**Services** :
- `DataRetentionService.spec.ts` : Purge de données (mock Prisma)
- `DistributedLockService.spec.ts` : Verrous distribués (mock Redis)
- `MessageDeliveryService.spec.ts` : Déduplication (mock Prisma)
- `WaitlistSecurityService.spec.ts` : Sécurité waitlist
- `ip-utils.spec.ts` : Détection IP

---

## 🚀 DÉPLOIEMENT & INFRASTRUCTURE

### Domaines

**Production** :
- `klozd.com` : Landing page marketing (Vercel)
- `my.klozd.com` : Application web (Vercel)
- `api.klozd.com` : API NestJS (OVH MKS / Kubernetes)

**Configuration DNS** :
- A/CNAME records selon l'hébergement
- Certificats SSL via cert-manager (Let's Encrypt)

### Variables d'Environnement

**API** (`apps/api/.env`) :
- `DATABASE_URL` : PostgreSQL connection string
- `REDIS_URL` : Redis connection string
- `JWT_SECRET` : Secret pour JWT
- `JWT_EXPIRES_IN` : Expiration access token (15m)
- `REFRESH_TOKEN_EXPIRES_IN` : Expiration refresh token (7d)
- `FRONTEND_URL` : URL frontend pour CORS
- `CORS_ORIGINS` : Origines CORS (comma-separated)
- `COOKIE_DOMAIN` : Domaine pour cookies (production)
- `TRUST_PROXY` : Activer trust proxy (true/false)
- `API_BASE_URL` : URL publique de l'API
- `RESEND_API_KEY` : Clé API Resend (emails)
- `TWILIO_ACCOUNT_SID` : Twilio Account SID
- `TWILIO_AUTH_TOKEN` : Twilio Auth Token
- `SENTRY_DSN` : Sentry DSN pour monitoring

**Web** (`apps/web/.env`) :
- `NEXT_PUBLIC_API_URL` : URL de l'API
- `NEXT_PUBLIC_APP_URL` : URL de l'application
- `SENTRY_DSN` : Sentry DSN

**Marketing** (`apps/marketing/.env`) :
- `NEXT_PUBLIC_API_URL` : URL de l'API
- `NEXT_PUBLIC_APP_URL` : URL de l'application

### Kubernetes (OVH MKS)

**Ingress NGINX** :
- Configuration pour `api.klozd.com`
- Certificats SSL automatiques (cert-manager)
- Proxy body size, timeouts configurables

**LoadBalancer** :
- Service type LoadBalancer
- IP publique pour l'API

**Configuration** :
- Replicas configurables
- Health checks
- Resource limits

---

## 📚 DOCUMENTATION

### Documentation Opérationnelle (`docs/ops/`)

- `backup.md` : Stratégie de backup Postgres
- `cron-locks.md` : Verrous distribués pour crons
- `domains.md` : Configuration DNS et domaines
- `ip-forwarding.md` : Détection IP derrière reverse proxy

### Documentation Technique

- `ARCHITECTURE.md` : Architecture générale
- `AUTH-REFRESH-TOKEN-PATCH.md` : Migration auth
- `AUDIT-LOG-PATCH.md` : Système d'audit
- `DATA-RETENTION-PATCH.md` : Rétention de données
- `WAITLIST-SETUP.md` : Setup waitlist
- `WAITLIST-SECURITY.md` : Sécurité waitlist
- `RESUME-8-PROMPTS.md` : Résumé des 8 prompts principaux

### ENV Variables

- `apps/api/ENV_VARIABLES.md` : Variables API
- `apps/web/ENV_VARIABLES.md` : Variables Web
- `apps/marketing/ENV_VARIABLES.md` : Variables Marketing

---

## 🔧 SCRIPTS UTILITAIRES

**API** (`apps/api/scripts/`) :
- `create-super-admin.ts` : Création compte SUPER_ADMIN
- `setup-prisma-models.sh` : Setup automatique Prisma
- `check-users.ts` : Vérification utilisateurs
- `verify-email.ts` : Vérification emails

**Root** :
- `check-setup.sh` : Vérification setup complet

---

## 📊 MÉTRIQUES & MONITORING

**Sentry** :
- Erreurs backend et frontend
- Performance monitoring
- Release tracking

**Logging** :
- Pino (structured logging)
- Niveaux : error, warn, info, debug
- Request ID pour traçabilité
- Logs formatés (JSON en prod, pretty en dev)

**Health Checks** :
- `GET /health` : Health check API
- Vérification DB, Redis, etc.

---

## 🎯 FONCTIONNALITÉS CLÉS

### 1. Multi-Tenant Isolation
- Isolation complète par organisation
- `TenantPrismaService` pour toutes les requêtes
- Protection contre les fuites de données

### 2. Audit Log Complet
- Enregistrement de toutes les mutations critiques
- Before/After states en JSON
- IP, User-Agent, Actor tracking
- Endpoint admin paginé

### 3. Déduplication Messages
- `MessageDelivery` pour garantir "no double send"
- Hash canonique du payload
- Statuts de livraison complets

### 4. Waitlist Sécurisée
- Validation stricte (email, honeypot, timestamp)
- Détection d'anomalies (IP, patterns)
- Secteurs d'activités (IT, Immobilier, Finance, etc.)
- Admin SUPER_ADMIN uniquement

### 5. Refresh Token Rotation
- Tokens courts (15 min) + longs (7-30 jours)
- Rotation automatique
- Révocation sécurisée

### 6. CSRF Protection
- Double-submit token pattern
- Protection sur refresh/logout

### 7. Data Retention
- Purge automatique des données anciennes
- Configurable par type de données
- Cron quotidien avec verrous distribués

### 8. Distributed Locks
- Prévention d'exécutions multiples de crons
- Redis-based avec fallback
- TTL appropriés par job

---

## 🛠️ OUTILS DE DÉVELOPPEMENT

**Linting** :
- ESLint configuré pour tous les apps
- Règles TypeScript strictes

**Formatting** :
- Prettier (si configuré)

**Type Safety** :
- TypeScript strict mode
- Prisma types générés
- Validation runtime (Zod, class-validator)

**Hot Reload** :
- NestJS watch mode
- Next.js Fast Refresh

---

## 📈 STATISTIQUES

**Codebase** :
- **Backend** : ~163 fichiers TypeScript
- **Frontend Web** : ~35 pages, ~20 composants
- **Marketing** : ~23 composants
- **Tests E2E** : 12+ fichiers
- **Tests Unitaires** : 5+ fichiers

**Base de Données** :
- ~20+ modèles Prisma
- Migrations versionnées
- Index optimisés

**API Endpoints** :
- ~50+ endpoints REST
- Documentation Swagger complète
- Validation DTOs sur tous les endpoints

---

## ✅ CHECKLIST PRODUCTION

**Sécurité** :
- ✅ HTTPS activé partout
- ✅ Cookies Secure + SameSite
- ✅ CORS configuré correctement
- ✅ Rate limiting actif
- ✅ CSRF protection
- ✅ Trust proxy configuré
- ✅ Helmet headers

**Performance** :
- ✅ Index DB optimisés
- ✅ Pagination sur listes
- ✅ Cache Redis pour sessions
- ✅ Queue BullMQ pour tâches lourdes

**Monitoring** :
- ✅ Sentry configuré
- ✅ Logging structuré
- ✅ Health checks

**Backup** :
- ✅ Stratégie documentée
- ✅ Tests de restore

---

**Fin du résumé technique total**
