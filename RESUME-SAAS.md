# 📊 KLOZD - Résumé Complet du SaaS

## 🎯 Vue d'ensemble

**KLOZD** est une plateforme SaaS CRM tout-en-un conçue spécifiquement pour les **infopreneurs** et les **équipes de closing**. Elle automatise l'ensemble du processus de génération de leads, de qualification, de planification et de closing.

---

## 🏗️ Architecture Technique

### Stack Technologique

- **Backend** : NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend** : Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **Architecture** : Monorepo avec pnpm workspaces
- **Authentification** : JWT (JSON Web Tokens)
- **Base de données** : PostgreSQL avec Prisma ORM
- **State Management** : Zustand (frontend)
- **Formulaires** : React Hook Form + Zod
- **HTTP Client** : Axios

### Structure du Projet

```
klozd/
├── apps/
│   ├── api/          # API NestJS (Backend)
│   └── web/          # Application Next.js (Frontend)
└── packages/         # Packages partagés (futur)
```

---

## 👥 Rôles Utilisateurs

### 1. **CEO** (Chef d'entreprise)
- **Accès complet** à toutes les fonctionnalités
- Gestion de l'organisation, facturation, paramètres
- Création et gestion de tous les utilisateurs
- Création et gestion des équipes
- Vue globale sur tous les leads, deals, rendez-vous
- Accès à tous les analytics et rapports
- Gestion des formulaires, webhooks, clés API

### 2. **MANAGER** (Manager d'équipe)
- Gestion de ses équipes (Closers et Setters)
- Vue sur les leads et deals de ses équipes
- Création de Closers et Setters
- Réassignation de leads
- Analytics d'équipe
- Gestion des rendez-vous de son équipe

### 3. **CLOSER** (Closer)
- Vue sur ses propres leads assignés
- Gestion de ses deals
- Vue sur ses rendez-vous
- Rejoindre les appels vidéo
- Analytics personnelles
- Suivi de ses performances

### 4. **SETTER** (Setter/Qualifieur)
- Qualification de leads
- Planification de rendez-vous pour les closers
- Vue sur ses leads qualifiés
- Vue sur les rendez-vous planifiés

### 5. **SUPPORT** (Support client)
- Vue sur les deals WON uniquement
- Accès limité aux analytics
- Suivi des clients après closing

### 6. **ADMIN** (Super Admin interne)
- Accès total à toutes les fonctionnalités
- Rôle réservé à l'équipe KLOZD (interne)

---

## 🎯 Modules Principaux

### 1. **Module Authentification** (`/auth`)
✅ **Implémenté**
- Inscription (crée automatiquement l'organisation + utilisateur CEO)
- Connexion avec JWT
- Gestion des sessions
- Protection des routes avec Guards
- Multi-tenant (isolation par organisation)

### 2. **Module Formulaires** (`/forms`)
✅ **Implémenté**
- **CRUD complet** des formulaires
- **Éditeur visuel** avec drag & drop
- **Champs personnalisés** : TEXT, EMAIL, PHONE, NUMBER, SELECT, CHECKBOX, TEXTAREA
- **Règles de scoring avancées** avec pondération des champs
- **Templates de formulaires** prédéfinis
- **Qualification automatique** basée sur le score minimum
- **Redirections conditionnelles** (qualified/disqualified)
- **Capture d'abandons** avec délai configurable
- **Statuts** : DRAFT, ACTIVE, PAUSED, ARCHIVED
- **Quotas** par plan d'abonnement

### 3. **Module Leads** (`/leads`)
✅ **Implémenté**
- **Soumission publique** de formulaires
- **Scoring automatique** basé sur les réponses
- **Qualification/disqualification** automatique
- **Extraction intelligente** : budget, secteur, urgence
- **Récupération des abandons** de formulaires
- **Attribution intelligente** aux closers
- **Filtrage par rôle** (CEO voit tout, Manager voit son équipe, etc.)
- **Pagination** pour les grandes listes

### 4. **Module CRM** (`/crm`)
✅ **Implémenté**
- **Gestion des deals** (affaires)
- **Pipeline Kanban** avec drag & drop
- **Vue liste** alternative avec colonnes personnalisables
- **Stages** : QUALIFIED, APPOINTMENT_SCHEDULED, PROPOSAL_SENT, NEGOTIATION, WON, LOST
- **Filtres avancés** : par closer, valeur, date, recherche
- **Tri** par colonnes
- **Export CSV** des deals
- **Statistiques de conversion** par stage
- **Filtrage par rôle** (isolation des données)

### 5. **Module Scheduling** (`/scheduling`)
✅ **Implémenté**
- **Création de rendez-vous** liés aux leads
- **Calendrier interactif** avec vue mensuelle/semaine/jour
- **Attribution intelligente** des closers (secteur, performance, charge)
- **Round robin** simple
- **Statuts** : SCHEDULED, CONFIRMED, COMPLETED, NO_SHOW, CANCELLED, RESCHEDULED
- **Confirmations automatiques** (T+0, J-1, H-1)
- **Rappels automatiques** de rendez-vous
- **Filtrage par rôle** (isolation des données)

### 6. **Module Calls** (`/calls`)
✅ **Implémenté**
- **Visio native** avec LiveKit (WebRTC)
- **Enregistrement des appels** (vidéo)
- **Intégration avec les rendez-vous**
- **Génération de tokens** sécurisés
- **Gestion des participants** (closers, prospects)
- **Statuts** : PENDING, ONGOING, COMPLETED, FAILED, CANCELLED
- **Stockage des enregistrements** (Object Storage)
- **Configuration technique** cachée (gérée uniquement backend)

### 7. **Module IA** (`/ai`)
✅ **Implémenté**
- **Prédiction de closing** (probabilité 0-100%)
- **Prédiction de valeur** de deal
- **Scoring de leads** avec pondération
- **Analyse de sentiment** (OpenAI)
- **Suggestions de messages** personnalisés
- **Calcul de confiance** des prédictions
- **Intégration OpenAI** pour prédictions avancées

### 8. **Module Notifications** (`/notifications`)
✅ **Implémenté**
- **Email** : SendGrid/Resend (transactionnel)
- **SMS** : Twilio
- **WhatsApp** : Twilio WhatsApp
- **Notifications in-app** avec badge de non-lus
- **Confirmations automatiques** de RDV
- **Rappels automatiques** (J-1, H-1)
- **Séquence de récupération** d'abandons (J+0, J+1, J+3)
- **Templates personnalisables**

### 9. **Module Dashboard** (`/dashboard`)
✅ **Implémenté**
- **Dashboard CEO** :
  - KPIs globaux (leads totaux, qualifiés, pipeline, revenus)
  - Performance par closer
  - Prochains appels du jour
  - Statistiques de conversion
- **Dashboard Manager** :
  - Performance de l'équipe
  - Leads et deals de l'équipe
  - Statistiques d'équipe
- **Dashboard Closer** :
  - Appels du jour
  - Leads assignés
  - Deals en cours
  - Statistiques personnelles
- **Dashboard Setter** :
  - Leads à qualifier
  - Rendez-vous planifiés
- **Dashboard Support** :
  - Deals WON
  - Clients à suivre

### 10. **Module Teams** (`/teams`)
✅ **Implémenté**
- **Création d'équipes** (CEO, Manager)
- **Gestion des membres** (ajout/suppression)
- **Assignation de Manager** par équipe
- **Vue par équipe** pour les managers
- **Filtrage des données** par équipe

### 11. **Module Users** (`/users`)
✅ **Implémenté**
- **Création d'utilisateurs** avec rôles
- **Gestion des utilisateurs** (activation/désactivation)
- **Permissions par rôle** (hiérarchie stricte)
- **Quotas d'utilisateurs** par plan
- **Filtrage par équipe** pour les managers

### 12. **Module Settings** (`/settings`)
✅ **Implémenté**
- **Paramètres d'organisation** (nom, logo, timezone, currency)
- **Gestion des abonnements** (solo, pro, business)
- **Quotas configurables** par plan
- **Paramètres de calls** (enregistrement activé/désactivé)
- **Configuration technique** cachée (backend uniquement)

### 13. **Module Reports** (`/reports`)
✅ **Implémenté**
- **Rapports personnalisables** par période
- **Analyse de conversion** par source
- **Performance par closer**
- **Statistiques de formulaires**
- **Export Excel/CSV**

### 14. **Module Webhooks** (`/webhooks`)
✅ **Implémenté**
- **Configuration de webhooks** personnalisés
- **Événements** : LEAD_CREATED, LEAD_QUALIFIED, DEAL_CREATED, DEAL_WON, etc.
- **Sécurité HMAC** pour la validation
- **Retry automatique** en cas d'échec
- **Logs des webhooks** envoyés

### 15. **Module API Keys** (`/api-keys`)
✅ **Implémenté**
- **Génération de clés API** pour intégrations
- **Gestion des clés** (création, révocation)
- **Permissions par clé**
- **Documentation Swagger/OpenAPI**

### 16. **Module Exports** (`/exports`)
✅ **Implémenté**
- **Export CSV/Excel** des leads
- **Export CSV/Excel** des deals
- **Export CSV/Excel** des rapports
- **Téléchargement direct**

---

## 💰 Plans d'Abonnement

### Plan **SOLO** (97€/mois)
- **Utilisateurs** : 3 max
- **Formulaires** : 5 max
- **Leads/mois** : 500 max
- **Rendez-vous/mois** : 100 max
- **SMS/mois** : 200 max
- **IA** : ✅ Activée
- **WhatsApp** : ❌ Désactivé
- **SMS** : ✅ Activé

### Plan **PRO** (147€/mois)
- **Utilisateurs** : 10 max
- **Formulaires** : 15 max
- **Leads/mois** : 2000 max
- **Rendez-vous/mois** : 500 max
- **SMS/mois** : 500 max
- **IA** : ✅ Activée
- **WhatsApp** : ✅ Activé
- **SMS** : ✅ Activé

### Plan **BUSINESS** (197€/mois)
- **Utilisateurs** : 25 max
- **Formulaires** : 50 max
- **Leads/mois** : 10000 max
- **Rendez-vous/mois** : 2000 max
- **SMS/mois** : 2000 max
- **IA** : ✅ Activée
- **WhatsApp** : ✅ Activé
- **SMS** : ✅ Activé

---

## 🔄 Flux Principal

### 1. **Capture de Leads**
```
Prospect remplit formulaire public
    ↓
Soumission enregistrée
    ↓
Scoring automatique calculé
    ↓
Lead créé (QUALIFIED ou DISQUALIFIED)
```

### 2. **Qualification**
```
Lead créé avec score
    ↓
Si score ≥ minScore → Lead QUALIFIED
    ↓
Attribution intelligente à un Closer
    ↓
Notification au Closer
```

### 3. **Planification**
```
Lead qualifié
    ↓
Setter ou Closer planifie un RDV
    ↓
Confirmation automatique (T+0)
    ↓
Rappels automatiques (J-1, H-1)
```

### 4. **Appel Vidéo**
```
Rendez-vous confirmé
    ↓
Génération de token LiveKit
    ↓
Page de call native
    ↓
Enregistrement automatique (si activé)
```

### 5. **Closing**
```
Appel complété
    ↓
Deal créé dans le pipeline
    ↓
Suivi des stages (QUALIFIED → NEGOTIATION → WON/LOST)
    ↓
Webhooks déclenchés
```

### 6. **Follow-up**
```
Deal WON
    ↓
Transfert au Support
    ↓
Suivi client
```

---

## 🔐 Sécurité & Permissions

### Système de Permissions
- **Permissions granulaires** par rôle
- **Isolation des données** par organisation (multi-tenant)
- **Filtrage automatique** selon le rôle
- **Guards NestJS** pour protéger les routes
- **Validation des données** avec class-validator

### Authentification
- **JWT** pour les sessions
- **Hashage bcrypt** des mots de passe
- **Protection CSRF** (Helmet)
- **Rate limiting** sur les endpoints publics

---

## 📊 Fonctionnalités Avancées

### Scoring & Qualification
- **Règles de scoring** personnalisables par champ
- **Pondération des champs** (weight)
- **Opérateurs** : equals, contains, greater_than, less_than, between, in
- **Score final** en pourcentage (0-100)
- **Qualification automatique** si score ≥ minScore

### Attribution Intelligente
- **Par secteur** (préférences du closer)
- **Par performance** (taux de closing)
- **Par charge** (nombre de RDV déjà planifiés)
- **Round robin** simple en fallback

### Automatisations
- **Confirmations automatiques** de RDV (T+0)
- **Rappels automatiques** (J-1, H-1)
- **Récupération d'abandons** (J+0, J+1, J+3)
- **Follow-ups automatiques** (désactivés - module Activities supprimé)

### Intégrations
- **LiveKit** : Visio native + enregistrement
- **SendGrid/Resend** : Emails transactionnels
- **Twilio** : SMS + WhatsApp
- **OpenAI** : Prédictions IA avancées
- **Webhooks** : Intégrations tierces (Zapier, Make.com)
- **API publique** : Swagger/OpenAPI avec clés API

---

## 🎨 Interface Utilisateur

### Design
- **Thème clair** inspiré de Simplified.com
- **Couleurs** : Orange (#fe9b27) et nuances (violet, rose, jaune)
- **Design professionnel** et corporate
- **Motifs subtils** en arrière-plan
- **Logo KLOZD** intégré partout
- **Favicon** personnalisé

### Composants Principaux
- **Navigation** responsive avec logo fixe
- **Dashboards** par rôle avec KPIs
- **Calendrier interactif** pour les rendez-vous
- **Pipeline Kanban** avec drag & drop
- **Éditeur de formulaires** visuel avec drag & drop
- **Notifications in-app** avec badge
- **Pagination** pour les grandes listes
- **Skeleton loaders** pour le chargement
- **Error boundaries** pour la gestion d'erreurs

---

## 📈 Statistiques & Analytics

### Métriques Disponibles
- **Leads totaux** et qualifiés
- **Taux de conversion** par stage
- **Valeur du pipeline** et deals gagnés
- **Performance par closer** (taux de closing, revenus)
- **Statistiques de formulaires** (soumissions, conversions)
- **Performance d'équipe** (pour les managers)
- **Projections de revenus** (pour CEO)

### Rapports
- **Rapports personnalisables** par période
- **Analyse de conversion** par source
- **Performance par closer**
- **Export Excel/CSV**

---

## 🧪 Tests

### Couverture
- **38 tests unitaires** passent sur 38
- **11 suites de tests** complètes
- **Modules testés** :
  - Auth (service + controller)
  - Forms (17 tests complets)
  - Leads
  - CRM
  - Dashboard
  - Scheduling
  - Settings
  - Users
  - Teams
  - App Controller

### Qualité
- **Tests réalistes** avec scénarios complets
- **Mocks Prisma** ajustés aux structures réelles
- **Validation des permissions** par rôle
- **Tests d'intégration** pour les formulaires

---

## 🚀 Déploiement

### Prérequis
- Node.js 20+
- pnpm 10+
- PostgreSQL 14+
- Variables d'environnement configurées

### Commandes
```bash
# Installation
pnpm install

# Développement
pnpm dev  # Lance API + Web en parallèle

# Production
pnpm build
pnpm start
```

---

## 📝 Points Clés

### ✅ Implémenté et Fonctionnel
- ✅ Authentification complète (JWT, multi-tenant)
- ✅ Gestion complète des formulaires avec scoring
- ✅ Pipeline CRM avec Kanban et vue liste
- ✅ Scheduling avec calendrier interactif
- ✅ Appels vidéo natifs avec enregistrement
- ✅ IA pour prédictions et scoring
- ✅ Notifications (Email, SMS, WhatsApp, In-app)
- ✅ Dashboards par rôle
- ✅ Gestion des équipes et utilisateurs
- ✅ Webhooks et API publique
- ✅ Exports CSV/Excel
- ✅ Rapports personnalisables
- ✅ Quotas et plans d'abonnement
- ✅ Filtrage des données par rôle
- ✅ Design professionnel et moderne

### 🎯 Spécificités
- **Multi-tenant** : Isolation complète par organisation
- **Permissions granulaires** : Système de permissions par rôle
- **Automatisations** : Confirmations, rappels, récupération d'abandons
- **IA intégrée** : Prédictions de closing et scoring intelligent
- **Visio native** : Pas de dépendance externe (LiveKit)
- **Configuration cachée** : Paramètres techniques gérés backend uniquement

---

## 📚 Documentation

- **ARCHITECTURE.md** : Documentation technique complète
- **RESUME-COMPLET.md** : Résumé fonctionnel détaillé
- **RESUME-ROLES.md** : Explication des rôles
- **ROLES-EXPLICATION-RAPIDE.md** : Guide rapide des rôles
- **SETUP.md** : Guide d'installation
- **TESTS-RESUME.md** : Résumé des tests

---

## 🎉 Conclusion

KLOZD est une **plateforme CRM complète et professionnelle** qui automatise l'ensemble du processus de génération de leads à la fermeture de deals. Elle offre :

- ✅ **Automatisation complète** du processus
- ✅ **IA intégrée** pour l'optimisation
- ✅ **Multi-tenant** sécurisé
- ✅ **Interface moderne** et intuitive
- ✅ **Scalabilité** avec quotas par plan
- ✅ **Intégrations** tierces (webhooks, API)

**Prêt pour la production** avec une base solide de tests et une architecture robuste.

