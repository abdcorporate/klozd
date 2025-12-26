# 📋 Menu CEO - Guide Complet

## 🎯 Vue d'Ensemble

Le **CEO** (propriétaire d'organisation) a accès à **TOUS** les modules de KLOZD pour gérer son organisation de A à Z.

---

## 📊 Menu de Navigation (Barre du haut)

### 1. **Dashboard** 📈
**URL :** `/dashboard`

**Description :**
Vue d'ensemble complète de l'activité de l'organisation avec :
- **KPIs principaux** :
  - Leads totaux
  - Leads qualifiés (% de qualification)
  - Pipeline (valeur totale des deals en cours)
  - CA ce mois (deals gagnés)
  
- **Taux de conversion** (funnel complet) :
  - Taux de qualification (Leads → Qualifiés)
  - Taux de RDV (Qualifiés → RDV planifiés)
  - Taux de show (RDV planifiés → RDV complétés)
  - Taux de no-show (RDV planifiés → No-show)
  - Taux de closing (RDV complétés → Deals gagnés)
  
- **Graphiques de tendances** (30 derniers jours) :
  - Évolution des leads
  - Évolution des RDV
  - Évolution des deals
  
- **Performance par closeur** :
  - Nombre d'appels
  - Nombre de deals gagnés
  - Taux de closing
  - CA généré
  
- **Prochains appels du jour** avec probabilité de closing

**Utilisation :** Page d'accueil pour suivre la performance globale

---

### 2. **Formulaires** 📝
**URL :** `/forms`

**Description :**
Gestion complète des formulaires de qualification :
- **Créer des formulaires** avec éditeur visuel (drag & drop)
- **Champs personnalisés** avec règles de scoring
- **Templates** de formulaires prédéfinis
- **Règles de qualification** automatiques (score minimum)
- **URLs publiques** pour partager les formulaires
- **Statistiques** : nombre de soumissions, leads générés

**Utilisation :** Créer et configurer les formulaires de capture de leads

**Exclusif CEO :** Seul le CEO peut créer/modifier les formulaires

---

### 3. **Leads** 👥
**URL :** `/leads`

**Description :**
Gestion de tous les leads de l'organisation :
- **Liste complète** de tous les leads (avec pagination)
- **Filtres avancés** :
  - Par statut (NEW, QUALIFIED, DISQUALIFIED, etc.)
  - Par closer assigné
  - Par setter assigné
  - Par score de qualification
  - Par date
  - Recherche textuelle
  
- **Vue détaillée** de chaque lead :
  - Informations complètes
  - Historique des activités
  - Prédiction IA (probabilité de closing)
  - Appointments associés
  - Deals associés
  
- **Actions** :
  - Réassigner un lead à un closer/setter
  - Qualifier/disqualifier manuellement
  - Exporter en CSV

**Utilisation :** Suivre et gérer tous les prospects de l'organisation

---

### 4. **CRM** 💼
**URL :** `/crm`

**Description :**
Gestion du pipeline commercial :
- **Vue Kanban** (par défaut) :
  - Colonnes par stage : QUALIFIED, APPOINTMENT_SCHEDULED, PROPOSAL_SENT, NEGOTIATION, WON, LOST
  - Drag & drop pour changer de stage
  - Filtres avancés (par closer, valeur, date, recherche)
  
- **Vue Liste** (alternative) :
  - Colonnes personnalisables
  - Tri par colonne
  - Export CSV
  
- **Création de deals** :
  - À partir d'un lead qualifié
  - Valeur, stage, notes
  
- **Statistiques** :
  - Valeur totale du pipeline
  - Taux de conversion par stage
  - Temps moyen dans chaque stage

**Utilisation :** Gérer le pipeline commercial et suivre les deals

---

### 5. **Planning** 📅
**URL :** `/scheduling`

**Description :**
Gestion des rendez-vous :
- **Calendrier interactif** :
  - Vue mensuelle/semaine/jour
  - Création de RDV
  - Modification/annulation
  
- **Liste des appointments** :
  - Filtres (date, closer, statut)
  - Recherche
  
- **Détails d'un RDV** :
  - Informations du lead
  - Lien visio (Zoom/Google Meet)
  - Statut (SCHEDULED, CONFIRMED, COMPLETED, NO_SHOW, CANCELLED)
  - Notes et outcome
  
- **Actions** :
  - Marquer comme complété
  - Marquer comme no-show
  - Replanifier

**Utilisation :** Gérer tous les rendez-vous de l'organisation

---

### 6. **Activités** ✅
**URL :** `/activities`

**Description :**
Suivi de toutes les activités :
- **Liste des activités** :
  - Par lead
  - Par type (CALL, EMAIL, SMS, WHATSAPP, NOTE, MEETING, FOLLOW_UP)
  - Par statut (PENDING, COMPLETED, CANCELLED, OVERDUE)
  - Par utilisateur
  - Recherche
  
- **Création d'activités** :
  - Manuelle
  - Automatique (follow-ups)
  
- **Filtres** :
  - Par lead
  - Par type
  - Par statut
  - Par utilisateur
  - Par date

**Utilisation :** Suivre toutes les interactions avec les leads

---

### 7. **Rapports** 📊
**URL :** `/reports`

**Description :**
Rapports et analyses avancées :
- **Rapport de performance** :
  - Période personnalisable (date range)
  - Métriques détaillées
  - Comparaisons période précédente
  
- **Analyse de conversion** :
  - Funnel détaillé
  - Points de blocage
  - Recommandations
  
- **Analyse par source** :
  - Performance des formulaires
  - Performance des canaux
  
- **Analyse par secteur** :
  - Performance par secteur d'activité
  
- **Graphiques** :
  - Tendances quotidiennes
  - Comparaisons

**Utilisation :** Analyses approfondies pour optimiser la performance

---

### 8. **Webhooks** 🔗
**URL :** `/webhooks`

**⚠️ ACCÈS RESTREINT :** Ce menu est réservé à **ADMIN uniquement** (équipe KLOZD interne). Le CEO n'a pas accès à cette configuration technique.

**Description :**
Configuration des webhooks pour intégrations externes (ADMIN uniquement) :
- **Créer des webhooks** :
  - URL de destination
  - Événements à écouter (LEAD_CREATED, DEAL_WON, etc.)
  - Secret pour signature HMAC
  - Actif/inactif
  
- **Liste des webhooks** :
  - Statut (actif/inactif)
  - Dernier déclenchement
  - Logs des webhooks
  
- **Événements disponibles** :
  - LEAD_CREATED, LEAD_QUALIFIED, LEAD_DISQUALIFIED
  - DEAL_CREATED, DEAL_WON, DEAL_LOST, DEAL_UPDATED
  - APPOINTMENT_SCHEDULED, APPOINTMENT_COMPLETED

**Utilisation :** Intégrer KLOZD avec d'autres outils (Zapier, Make.com, etc.)

**Exclusif ADMIN :** Seul l'ADMIN (équipe KLOZD interne) peut configurer les webhooks

---

### 9. **Clés API** 🔑
**URL :** `/api-keys`

**⚠️ ACCÈS RESTREINT :** Ce menu est réservé à **ADMIN uniquement** (équipe KLOZD interne). Le CEO n'a pas accès à cette configuration technique.

**Description :**
Gestion des clés API pour accès programmatique (ADMIN uniquement) :
- **Créer des clés API** :
  - Nom de la clé
  - Scopes (permissions)
  - Date d'expiration
  
- **Liste des clés** :
  - Préfixe (pour sécurité)
  - Dernière utilisation
  - Scopes
  - Statut
  
- **Documentation API** :
  - Lien vers Swagger/OpenAPI
  - Endpoints disponibles

**Utilisation :** Accès programmatique à l'API pour intégrations personnalisées

**Exclusif ADMIN :** Seul l'ADMIN (équipe KLOZD interne) peut créer des clés API

---

### 10. **Utilisateurs** 👤
**URL :** `/users`

**Description :**
Gestion des utilisateurs de l'organisation :
- **Liste des utilisateurs** :
  - Tous les rôles (CEO, MANAGER, CLOSER, SETTER, SUPPORT)
  - Statut (ACTIVE, INACTIVE, SUSPENDED)
  - Équipes associées
  
- **Créer un utilisateur** :
  - Email, prénom, nom
  - Rôle (sauf ADMIN)
  - Équipe (optionnel)
  
- **Actions** :
  - Modifier un utilisateur
  - Activer/désactiver
  - Supprimer
  - Réassigner à une équipe

**Utilisation :** Gérer l'équipe et les accès

**Note :** Le CEO peut créer tous les rôles sauf ADMIN

---

### 11. **Équipes** 👥
**URL :** `/teams`

**Description :**
Gestion des équipes :
- **Liste des équipes** :
  - Nom, description
  - Manager assigné
  - Membres
  
- **Créer une équipe** :
  - Nom, description
  - Manager (doit être un MANAGER)
  
- **Gérer les membres** :
  - Ajouter des utilisateurs
  - Retirer des utilisateurs
  - Voir les performances de l'équipe

**Utilisation :** Organiser l'équipe en groupes (équipes de closers, setters, etc.)

---

### 12. **Paramètres** ⚙️
**URL :** `/settings`

**Description :**
Configuration globale de l'organisation :
- **Informations de l'organisation** :
  - Nom
  - Logo
  - Fuseau horaire
  - Devise
  
- **Facturation** :
  - Plan actuel (Solo/Pro/Business)
  - Prix mensuel
  - Quotas du plan (utilisateurs, formulaires, leads/mois, etc.)
  - Changer de plan
  
- **Intégrations** :
  - Zoom (configuration)
  - SendGrid/Resend (configuration)
  - Twilio (configuration)

**Utilisation :** Configurer l'organisation et gérer l'abonnement

**Exclusif CEO/ADMIN :** Seuls le CEO et l'ADMIN peuvent modifier les paramètres

---

## 🎯 Résumé des Accès CEO

### ✅ Accès Complet
- **Dashboard** : Vue d'ensemble complète
- **Formulaires** : Création et gestion (exclusif CEO)
- **Leads** : Tous les leads de l'organisation
- **CRM** : Pipeline complet
- **Planning** : Tous les rendez-vous
- **Activités** : Toutes les activités
- **Rapports** : Analyses avancées
- **Webhooks** : Configuration (exclusif CEO/ADMIN)
- **Clés API** : Gestion (exclusif CEO/ADMIN)
- **Utilisateurs** : Gestion complète
- **Équipes** : Gestion complète
- **Paramètres** : Configuration globale (exclusif CEO/ADMIN)

### 🔒 Permissions Spéciales
- **Créer tous les rôles** (sauf ADMIN)
- **Voir toutes les données** de son organisation
- **Modifier les paramètres** de l'organisation
- **Gérer la facturation** et changer de plan
- **Configurer les intégrations** externes
- **Créer des webhooks** et clés API (ADMIN uniquement)

---

## 💡 Cas d'Usage Typiques

### Scénario 1 : Créer un nouveau formulaire
1. Aller dans **Formulaires**
2. Cliquer "Créer un formulaire"
3. Utiliser l'éditeur visuel
4. Configurer les règles de scoring
5. Activer le formulaire
6. Partager l'URL publique

### Scénario 2 : Suivre la performance
1. Aller dans **Dashboard**
2. Voir les KPIs et taux de conversion
3. Analyser les graphiques de tendances
4. Voir la performance par closeur
5. Aller dans **Rapports** pour analyses approfondies

### Scénario 3 : Gérer l'équipe
1. Aller dans **Utilisateurs** pour créer un nouveau closer
2. Aller dans **Équipes** pour créer une équipe
3. Assigner le closer à l'équipe
4. Assigner un manager à l'équipe

### Scénario 4 : Configurer les intégrations
1. Aller dans **Paramètres**
2. Configurer Zoom/Google Meet
3. Configurer SendGrid/Resend pour emails
4. Configurer Twilio pour SMS/WhatsApp
5. Les **Webhooks** et **Clés API** sont réservés à l'équipe KLOZD (ADMIN)

---

## 📱 Interface

Le menu apparaît en **barre de navigation horizontale** en haut de chaque page :
- Logo **KLOZD** à gauche (lien vers Dashboard)
- Menu de navigation au centre
- Notifications (badge avec nombre non lus) à droite
- Nom de l'utilisateur
- Bouton "Déconnexion"

L'élément actif est mis en évidence avec un fond noir et texte blanc.

