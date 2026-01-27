# 🎭 Implémentation des Rôles et Permissions - KLOZD

## ✅ Ce qui a été fait

### 1. **Schéma de base de données mis à jour**

- ✅ Ajout des rôles : `CEO`, `MANAGER`, `CLOSER`, `SETTER`, `SUPPORT`, `ADMIN`
- ✅ Création du modèle `Team` (équipes)
- ✅ Création du modèle `TeamMember` (membres d'équipe)
- ✅ Ajout des relations User ↔ Team
- ✅ Ajout de `assignedSetterId` dans Lead (pour les setters)
- ✅ Mise à jour de `OrganizationSettings` avec :
  - Plans : `solo`, `pro`, `business`
  - Quotas : SMS, appointments, etc.
  - Configuration IA : seuil de qualification, poids de scoring
  - Billing : email, adresse

### 2. **Système de permissions**

- ✅ Création de `Permission` enum avec toutes les permissions
- ✅ Mapping `ROLE_PERMISSIONS` pour chaque rôle
- ✅ Fonctions utilitaires :
  - `hasPermission()` : vérifier une permission
  - `canAccessResource()` : vérifier l'accès à une ressource
  - `canCreateUserWithRole()` : vérifier si on peut créer un user avec un rôle

### 3. **Module Teams**

- ✅ `TeamsModule` créé
- ✅ `TeamsService` avec :
  - `create()` : créer une équipe (CEO/Manager)
  - `findAll()` : lister les équipes (filtré par rôle)
  - `findOne()` : détails d'une équipe
  - `update()` : mettre à jour
  - `addMember()` : ajouter un membre
  - `removeMember()` : retirer un membre
  - `remove()` : supprimer une équipe (CEO seulement)
- ✅ `TeamsController` avec tous les endpoints
- ✅ DTOs pour validation

### 4. **Guards de permissions**

- ✅ `RolesGuard` créé
- ✅ Décorateur `@RequirePermissions()` pour protéger les routes

## 📋 Permissions par rôle

### 👑 CEO
- ✅ Gestion complète de l'organisation
- ✅ Facturation et paramètres
- ✅ Création de tous les utilisateurs (sauf ADMIN)
- ✅ Gestion de toutes les équipes
- ✅ Accès à toutes les données
- ✅ Configuration globale

### 🧠 MANAGER
- ✅ Créer Closers et Setters
- ✅ Gérer ses équipes
- ✅ Voir les leads de son équipe
- ✅ Réassigner des leads
- ✅ Gérer les deals de son équipe
- ✅ Voir les stats de son équipe
- ❌ Pas de facturation
- ❌ Pas de paramètres globaux

### 🎯 CLOSER
- ✅ Voir ses leads assignés
- ✅ Mettre à jour ses leads
- ✅ Gérer ses deals
- ✅ Voir son planning
- ✅ Gérer ses RDV
- ✅ Voir ses stats personnelles
- ❌ Pas d'accès aux autres leads
- ❌ Pas de gestion d'équipe

### 📞 SETTER
- ✅ Voir les leads entrants
- ✅ Qualification simple
- ✅ Proposer des RDV pour closers
- ✅ Gérer les confirmations
- ❌ Pas de deals
- ❌ Pas de stats financières détaillées

### 🛟 SUPPORT
- ✅ Voir les deals WON (clients signés)
- ✅ Voir l'historique des interactions
- ✅ Ajouter des notes de support
- ❌ Pas d'accès au pipeline complet
- ❌ Pas de gestion d'équipe

## 🔄 Migration appliquée

- ✅ Migration `20261222203011_add_teams_and_roles` créée et appliquée
- ✅ Prisma Client régénéré

## 🚧 À faire (prochaines étapes)

### 1. Mettre à jour les services existants
- [ ] `LeadsService` : filtrer par rôle (CEO voit tout, Manager voit son équipe, Closer voit ses leads)
- [ ] `CrmService` : même logique de filtrage
- [ ] `DashboardService` : dashboards spécifiques par rôle
- [ ] `SchedulingService` : filtrage des RDV par rôle

### 2. Créer les dashboards spécifiques
- [ ] Dashboard Manager (performance équipe, leaderboard)
- [ ] Dashboard Closer (appels du jour, stats perso)
- [ ] Dashboard Setter (leads à qualifier, RDV à planifier)
- [ ] Dashboard Support (clients signés, suivi)

### 3. Mettre à jour le frontend
- [ ] Pages Teams (création, gestion)
- [ ] Filtrage des données selon le rôle
- [ ] Menus conditionnels selon les permissions
- [ ] Dashboards spécifiques par rôle

### 4. Endpoints utilisateurs
- [ ] `POST /users` : créer un utilisateur (avec vérification de rôle)
- [ ] `GET /users` : lister les utilisateurs (filtré par rôle)
- [ ] `PATCH /users/:id` : mettre à jour (avec permissions)
- [ ] `DELETE /users/:id` : désactiver (CEO/Manager)

### 5. Améliorations
- [ ] Vérification des quotas (maxUsers, maxLeadsPerMonth, etc.)
- [ ] Logique d'attribution intelligente avec équipes
- [ ] Notifications selon le rôle
- [ ] Audit log des actions sensibles

## 📝 Notes

- Le système de permissions est prêt à être utilisé
- Les guards peuvent être ajoutés aux controllers existants
- La logique de filtrage par équipe sera implémentée dans les services
- Les dashboards spécifiques seront créés dans `DashboardService`




