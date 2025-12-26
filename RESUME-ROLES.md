# 👥 Résumé Rapide des Rôles KLOZD

## 🔴 ADMIN (Super Admin KLOZD)
**Qui ?** Administrateur interne KLOZD (pas un client)

**Peut faire :**
- ✅ Voir **TOUTES** les organisations
- ✅ Accéder à **TOUTES** les données (toutes orgs)
- ✅ Gérer tous les utilisateurs (toutes orgs)
- ✅ Dashboard global avec stats de toutes les orgs
- ✅ Toutes les permissions

**Ne peut pas :** Rien, il a tout accès

**Dashboard :** Vue globale (toutes orgs, stats globales, top organisations)

---

## 👑 CEO (Propriétaire d'organisation)
**Qui ?** Le client principal (infopreneur, head of sales)

**Peut faire :**
- ✅ Gérer son organisation (nom, logo, facturation)
- ✅ Créer tous les rôles (sauf ADMIN)
- ✅ Voir **TOUTES** les données de son org
- ✅ Configurer formulaires, pipelines, intégrations
- ✅ Gérer les équipes et utilisateurs
- ✅ Accès à la facturation et paramètres globaux

**Ne peut pas :** Voir les autres organisations

**Dashboard :** Vue complète de l'organisation (KPIs, conversions, performances)

---

## 🧠 MANAGER (Responsable d'équipe)
**Qui ?** Responsable d'une ou plusieurs équipes de closers/setters

**Peut faire :**
- ✅ Créer Closers, Setters, Support
- ✅ Gérer ses équipes (membres, performance)
- ✅ Voir tous les leads de son équipe
- ✅ Réassigner des leads entre closers
- ✅ Voir les performances de son équipe
- ✅ Forcer des rebookings

**Ne peut pas :**
- ❌ Créer CEO ou autres Managers
- ❌ Accéder à la facturation
- ❌ Voir les autres équipes (sauf si explicitement autorisé)

**Dashboard :** Performance équipe, leaderboard, stats de son périmètre

---

## 🎯 CLOSER (Closer)
**Qui ?** La personne qui fait les appels et signe les deals

**Peut faire :**
- ✅ Voir ses leads assignés uniquement
- ✅ Créer et gérer ses deals
- ✅ Mettre à jour le statut des leads
- ✅ Voir son planning de RDV
- ✅ Marquer RDV (show, no-show, completed)
- ✅ Ajouter notes d'appel et follow-ups

**Ne peut pas :**
- ❌ Voir les leads des autres closers
- ❌ Modifier les formulaires globaux
- ❌ Gérer les autres utilisateurs

**Dashboard :** Appels du jour, stats mensuelles, follow-ups, classement personnel

---

## 📞 SETTER (Qualificateur)
**Qui ?** La personne qui chauffe les leads et prend les RDV

**Peut faire :**
- ✅ Voir les leads entrants (assignés ou non assignés)
- ✅ Qualifier les leads
- ✅ Planifier des RDV pour les closers
- ✅ Gérer confirmations et rebookings
- ✅ Utiliser scripts IA pour qualification

**Ne peut pas :**
- ❌ Voir les détails financiers complets (CA détaillé)
- ❌ Gérer les formulaires globaux
- ❌ Gérer les autres utilisateurs

**Dashboard :** Leads à qualifier, leads à planifier, stats de qualification

---

## 🛟 SUPPORT (Support client)
**Qui ?** Personne qui s'occupe du suivi client après-vente

**Peut faire :**
- ✅ Voir les clients signés (deals WON uniquement)
- ✅ Voir l'historique des interactions
- ✅ Ajouter notes de support/suivi
- ✅ Créer tâches liées aux clients
- ✅ Suivre les tickets/problèmes

**Ne peut pas :**
- ❌ Voir les leads bruts / pipeline complet
- ❌ Accéder aux paramètres, équipes, facturation
- ❌ Gérer les autres utilisateurs

**Dashboard :** Clients signés, historique, tâches de suivi en attente

---

## 📊 Comparaison Rapide

| Rôle | Portée | Créer Users | Voir Tous Leads | Gérer Équipes | Facturation |
|------|--------|-------------|-----------------|---------------|-------------|
| **ADMIN** | Toutes orgs | ✅ Tous | ✅ Toutes orgs | ✅ Toutes orgs | ✅ Toutes orgs |
| **CEO** | Son org | ✅ Tous (sauf ADMIN) | ✅ Son org | ✅ Son org | ✅ Son org |
| **MANAGER** | Ses équipes | ✅ Closer/Setter/Support | ✅ Ses équipes | ✅ Ses équipes | ❌ |
| **CLOSER** | Ses leads | ❌ | ❌ (seulement siens) | ❌ | ❌ |
| **SETTER** | Leads à qualifier | ❌ | ⚠️ (assignés ou non assignés) | ❌ | ❌ |
| **SUPPORT** | Clients signés | ❌ | ❌ (seulement WON) | ❌ | ❌ |

---

## 🔑 Comptes de Test

- **ADMIN** : `admin@klozd.app` / `admin123456`
- **CEO** : `ceo@klozd.app` / `ceo123456`
- **MANAGER** : `manager@klozd.app` / `manager123456`
- **CLOSER** : `closer@klozd.app` / `closer123456`
- **SETTER** : `setter@klozd.app` / `setter123456`
- **SUPPORT** : `support@klozd.app` / `support123456`




