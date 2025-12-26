# Plan de Tests Complet - KLOZD SaaS

## 📋 Vue d'ensemble

Ce document décrit la stratégie de tests pour tous les modules du SaaS KLOZD.

## 🎯 Objectifs

- **Couverture de code** : Minimum 80% pour les services critiques
- **Tests unitaires** : Tous les services et controllers
- **Tests d'intégration** : Endpoints API principaux
- **Tests E2E** : Flux utilisateur complets

## 📦 Modules à Tester

### ✅ Backend (NestJS)

#### 1. **Auth Module** ✅
- [x] `auth.service.spec.ts` - Tests du service d'authentification
- [x] `auth.controller.spec.ts` - Tests du controller
- **Tests couverts** :
  - Registration (succès, email existant)
  - Login (succès, utilisateur inexistant, mot de passe incorrect)
  - JWT token generation

#### 2. **Forms Module** ✅
- [x] `forms.service.spec.ts` - Tests du service de formulaires
- **Tests couverts** :
  - Création de formulaire (succès, quota dépassé)
  - Liste des formulaires
  - Récupération d'un formulaire
  - Mise à jour
  - Suppression

#### 3. **Leads Module** ✅
- [x] `leads.service.spec.ts` - Tests du service de leads
- **Tests couverts** :
  - Soumission de formulaire
  - Création de lead
  - Qualification automatique
  - Quota mensuel
  - Scoring

#### 4. **CRM Module** ✅
- [x] `crm.service.spec.ts` - Tests du service CRM
- **Tests couverts** :
  - Création de deal
  - Liste des deals
  - Mise à jour de deal
  - Changement de stage
  - Filtrage par rôle

#### 5. **Dashboard Module** ✅
- [x] `dashboard.service.spec.ts` - Tests du service dashboard
- **Tests couverts** :
  - Dashboard CEO
  - Dashboard Manager
  - Dashboard Closer
  - Dashboard Setter
  - Dashboard Support

#### 6. **Scheduling Module** ⏳
- [ ] `scheduling.service.spec.ts`
- **Tests à couvrir** :
  - Création d'appointment
  - Attribution automatique
  - Confirmation automatique
  - Récupération d'abandon
  - Génération de liens visio

#### 7. **AI Module** ⏳
- [ ] `ai.service.spec.ts`
- **Tests à couvrir** :
  - Prédiction de probabilité de closing
  - Suggestions de messages
  - Analyse de sentiment

#### 8. **Notifications Module** ⏳
- [ ] `notifications.service.spec.ts`
- **Tests à couvrir** :
  - Envoi d'email
  - Envoi de SMS
  - Envoi WhatsApp
  - Notifications in-app

#### 9. **Teams Module** ⏳
- [ ] `teams.service.spec.ts`
- **Tests à couvrir** :
  - Création d'équipe
  - Ajout de membres
  - Gestion des rôles

#### 10. **Users Module** ⏳
- [ ] `users.service.spec.ts`
- **Tests à couvrir** :
  - Création d'utilisateur
  - Liste des utilisateurs
  - Mise à jour
  - Activation/Désactivation

#### 11. **Settings Module** ⏳
- [ ] `settings.service.spec.ts`
- **Tests à couvrir** :
  - Récupération des paramètres
  - Mise à jour des paramètres
  - Gestion des plans tarifaires

#### 12. **Calls Module** ⏳
- [ ] `calls.service.spec.ts`
- **Tests à couvrir** :
  - Génération de token LiveKit
  - Création de room
  - Gestion des participants
  - Enregistrement

#### 13. **Webhooks Module** ⏳
- [ ] `webhooks.service.spec.ts`
- **Tests à couvrir** :
  - Création de webhook
  - Déclenchement de webhook
  - Signature HMAC

#### 14. **API Keys Module** ⏳
- [ ] `api-keys.service.spec.ts`
- **Tests à couvrir** :
  - Création de clé API
  - Révocation
  - Validation

#### 15. **Exports Module** ⏳
- [ ] `exports.service.spec.ts`
- **Tests à couvrir** :
  - Export CSV
  - Export Excel
  - Filtrage des données

#### 16. **Reports Module** ⏳
- [ ] `reports.service.spec.ts`
- **Tests à couvrir** :
  - Génération de rapports
  - Filtrage par période
  - Métriques

### ⏳ Frontend (Next.js)

#### Tests de Composants
- [ ] Tests des composants React
- [ ] Tests des pages
- [ ] Tests des stores Zustand

#### Tests E2E
- [ ] Flux d'authentification
- [ ] Création de formulaire
- [ ] Soumission de formulaire
- [ ] Gestion des leads
- [ ] Pipeline CRM
- [ ] Planning

## 🚀 Commandes de Test

### Backend
```bash
# Tous les tests
pnpm --filter api test

# Tests en mode watch
pnpm --filter api test:watch

# Tests avec couverture
pnpm --filter api test:cov

# Tests E2E
pnpm --filter api test:e2e
```

### Frontend
```bash
# Tests (à configurer)
pnpm --filter web test
```

## 📊 Métriques de Qualité

- **Couverture minimale** : 80%
- **Tests unitaires** : Tous les services
- **Tests d'intégration** : Tous les endpoints critiques
- **Tests E2E** : Flux principaux

## 🔄 Prochaines Étapes

1. ✅ Créer les tests pour Auth, Forms, Leads, CRM, Dashboard
2. ⏳ Créer les tests pour Scheduling, AI, Notifications
3. ⏳ Créer les tests pour Teams, Users, Settings
4. ⏳ Créer les tests pour Calls, Webhooks, API Keys, Exports, Reports
5. ⏳ Configurer les tests frontend
6. ⏳ Créer les tests E2E complets

## 📝 Notes

- Utiliser des mocks pour Prisma
- Tester les cas d'erreur
- Tester les permissions et rôles
- Tester les quotas et limites
- Tester la validation des données




