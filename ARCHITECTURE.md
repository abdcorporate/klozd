# Architecture KLOZD - Documentation Technique

## Vue d'ensemble

KLOZD est une plateforme SaaS CRM tout-en-un pour infopreneurs et équipes de closing, construite avec :
- **Backend** : NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend** : Next.js 16 + TypeScript + Tailwind CSS
- **Architecture** : Monorepo avec pnpm workspaces

## Structure du Projet

```
klozd/
├── apps/
│   ├── api/          # API NestJS
│   └── web/          # Application Next.js
├── packages/         # Packages partagés (futur)
└── pnpm-workspace.yaml
```

## Base de Données (Prisma)

### Modèles Principaux

#### Organizations & Users
- `Organization` : Organisation/entreprise cliente
- `User` : Utilisateurs (CEO, Closer, Setter)
- `CloserSettings` : Paramètres spécifiques aux closeurs
- `OrganizationSettings` : Configuration de l'organisation

#### Forms & Qualification
- `Form` : Formulaires de qualification
- `FormField` : Champs de formulaire avec règles de scoring
- `FormSubmission` : Soumissions de formulaires
- `FormAbandon` : Capture des abandons de formulaire

#### Leads & Pipeline
- `Lead` : Prospects/leads
- `Appointment` : Rendez-vous planifiés
- `Deal` : Affaires/deals dans le pipeline
- `Activity` : Activités et follow-ups

#### IA & Analytics
- `AIPrediction` : Prédictions IA de closing

#### Notifications
- `Notification` : Notifications (Email, SMS, WhatsApp, In-app)

## Modules API (NestJS)

### 1. Auth Module (`/auth`)
- **Endpoints** :
  - `POST /auth/register` : Inscription (crée org + user CEO)
  - `POST /auth/login` : Connexion (JWT)
- **Guards** : `JwtAuthGuard` pour protéger les routes
- **Decorator** : `@CurrentUser()` pour récupérer l'utilisateur connecté

### 2. Forms Module (`/forms`)
- **Endpoints** :
  - `POST /forms` : Créer un formulaire
  - `GET /forms` : Lister les formulaires
  - `GET /forms/:id` : Détails d'un formulaire
  - `PATCH /forms/:id` : Mettre à jour
  - `DELETE /forms/:id` : Supprimer
- **Fonctionnalités** :
  - Création de formulaires avec champs personnalisés
  - Règles de qualification et scoring
  - Capture des abandons

### 3. Leads Module (`/leads`)
- **Endpoints** :
  - `POST /leads/forms/:formId/submit` : Soumettre un formulaire (public)
  - `GET /leads` : Lister les leads (authentifié)
  - `GET /leads/:id` : Détails d'un lead
- **Fonctionnalités** :
  - Soumission de formulaires
  - Qualification automatique
  - Attribution intelligente aux closeurs

### 4. CRM Module (`/crm`)
- **Endpoints** :
  - `POST /crm/deals` : Créer un deal
  - `GET /crm/deals` : Lister les deals
  - `GET /crm/pipeline` : Vue pipeline par stage
  - `PATCH /crm/deals/:id` : Mettre à jour un deal
- **Fonctionnalités** :
  - Gestion du pipeline de vente
  - Suivi des deals par stage
  - Statistiques de conversion

### 5. Dashboard Module (`/dashboard`)
- **Endpoints** :
  - `GET /dashboard/ceo` : Dashboard CEO (vue d'ensemble)
  - `GET /dashboard/closer` : Dashboard Closeuse (vue opérationnelle)
- **Métriques** :
  - Vue CEO : KPIs globaux, performance équipe, pipeline value
  - Vue Closeuse : Appels du jour, follow-ups, stats personnelles, leaderboard

## Variables d'Environnement

Créer un fichier `.env` dans `apps/api/` :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/klozd?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# App
PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_URL="http://localhost:3000"

# Email, SMS, WhatsApp, Visio, AI (à configurer selon besoins)
```

## Commandes

### Backend (API)
```bash
cd apps/api

# Installer les dépendances
pnpm install

# Générer le client Prisma
pnpm prisma:generate

# Créer une migration
pnpm prisma:migrate

# Démarrer en dev
pnpm start:dev

# Ouvrir Prisma Studio
pnpm prisma:studio
```

### Frontend (Web)
```bash
cd apps/web

# Installer les dépendances
pnpm install

# Démarrer en dev
pnpm dev
```

### Monorepo
```bash
# Démarrer API + Web en parallèle
pnpm dev

# Démarrer uniquement l'API
pnpm dev:api

# Démarrer uniquement le Web
pnpm dev:web
```

## Modules Implémentés ✅

### 1. **Module Scheduling** (`/scheduling`) ✅
- ✅ Création et gestion des rendez-vous
- ✅ Attribution intelligente des closeurs (secteur, performance, charge)
- ✅ Round robin simple
- ✅ Gestion des statuts (SCHEDULED, CONFIRMED, COMPLETED, NO_SHOW)
- ⏳ Intégration visio (structure prête, à connecter avec Zoom/Google Meet)

### 2. **Module IA** (`/ai`) ✅
- ✅ Scoring de leads basé sur les réponses du formulaire
- ✅ Prédiction de closing (probabilité 0-100%)
- ✅ Prédiction de valeur de deal
- ✅ Calcul de confiance des prédictions
- ⏳ Modèle ML avancé (prêt pour intégration OpenAI)

### 3. **Module Notifications** (`/notifications`) ✅
- ✅ Service Email (structure prête pour SendGrid/Resend)
- ✅ Service SMS (structure prête pour Twilio)
- ✅ Service WhatsApp (structure prête pour Twilio WhatsApp)
- ✅ Confirmations automatiques de RDV
- ✅ Rappels de RDV (J-1, H-1)
- ✅ Séquence de récupération d'abandons
- ✅ Notifications in-app

### 4. **Module Formulaires** (`/forms`) ✅
- ✅ CRUD complet des formulaires
- ✅ Champs personnalisés avec règles de scoring
- ✅ Qualification automatique basée sur le score
- ✅ Extraction automatique (budget, secteur, urgence)
- ✅ Soumission publique de formulaires

### 5. **Module Leads** (`/leads`) ✅
- ✅ Soumission de formulaires avec scoring
- ✅ Qualification/disqualification automatique
- ✅ Récupération des abandons
- ✅ Liste et détails des leads
- ⏳ Attribution automatique (intégré dans Scheduling)

### 6. **Module CRM** (`/crm`) ✅
- ✅ Gestion des deals
- ✅ Pipeline par stage
- ✅ Statistiques de conversion

### 7. **Module Dashboard** (`/dashboard`) ✅
- ✅ Dashboard CEO (KPIs, performance équipe, pipeline)
- ✅ Dashboard Closeuse (appels du jour, follow-ups, stats)

## Prochaines Étapes

### À Implémenter

1. **Capture des Abandons** ⏳
   - ⏳ Détection automatique (30s d'inactivité)
   - ⏳ Séquence de récupération automatique (J+0, J+1, J+3)
   - ✅ Structure DB prête

2. **Module Activities** ⏳
   - ⏳ Système de follow-up automatique
   - ⏳ Gestion des tâches
   - ✅ Structure DB prête

3. **Frontend Next.js** ⏳
   - ⏳ Pages d'authentification
   - ⏳ Dashboard CEO
   - ⏳ Dashboard Closeuse
   - ⏳ Gestion des formulaires
   - ⏳ Pipeline CRM
   - ⏳ Calendrier de scheduling
   - ⏳ Formulaire public de soumission

4. **Intégrations** ⏳
   - ⏳ Zoom/Google Meet pour visio
   - ⏳ SendGrid/Resend pour emails
   - ⏳ Twilio pour SMS/WhatsApp
   - ⏳ OpenAI pour prédictions avancées

## Architecture des Données

### Flow Principal

1. **Lead Capture** : Prospect remplit formulaire → Lead créé
2. **Qualification** : Scoring automatique → Lead qualifié/disqualifié
3. **Attribution** : IA attribue le lead au meilleur closer
4. **Scheduling** : Prospect réserve un RDV
5. **Confirmation** : Séquence automatique de confirmations
6. **Appel** : Visio intégrée, suivi de l'appel
7. **Closing** : Deal créé, pipeline mis à jour
8. **Follow-up** : Activités automatiques de suivi

## Sécurité

- Authentification JWT
- Validation des données avec `class-validator`
- Guards pour protéger les routes
- Isolation des données par organisation
- Hashage des mots de passe avec bcrypt

## Performance

- Index sur les champs fréquemment interrogés
- Relations Prisma optimisées
- Pagination à implémenter pour les listes
- Cache à considérer pour les dashboards

