# 👥 Les Rôles KLOZD - Explication Rapide

## 🔴 ADMIN (Super Admin KLOZD)
**Qui ?** Administrateur interne KLOZD (pas un client)

**En quelques mots :** Accès total à toutes les organisations et toutes les données. Dashboard global avec statistiques de toutes les organisations. Utilisé uniquement par l'équipe KLOZD pour le support et la maintenance.

---

## 👑 CEO (Propriétaire d'organisation)
**Qui ?** Le client principal (infopreneur, head of sales, fondateur)

**En quelques mots :** Propriétaire de l'organisation avec accès complet à toutes les fonctionnalités. Peut créer tous les rôles (sauf ADMIN), gérer la facturation, configurer les intégrations, voir toutes les données de son organisation. Dashboard avec vue d'ensemble complète (KPIs, conversions, performances).

---

## 🧠 MANAGER (Responsable d'équipe)
**Qui ?** Responsable d'une ou plusieurs équipes de closers/setters

**En quelques mots :** Gère ses équipes : peut créer des Closers et Setters, voir les leads et performances de son équipe, réassigner des leads entre closers. Dashboard avec métriques d'équipe et performance par membre. Ne peut pas accéder à la facturation ni créer d'autres Managers.

---

## 💼 CLOSER (Closer)
**Qui ?** Commercial qui ferme les deals

**En quelques mots :** Gère ses leads assignés, crée et suit ses deals, planifie ses rendez-vous. Dashboard personnel avec ses appels du jour, ses follow-ups à faire, ses stats (taux de closing, CA généré). Voit uniquement ses propres données, pas celles des autres closers.

---

## 📞 SETTER (Qualificateur)
**Qui ?** Personne qui qualifie les leads avant de les passer aux closers

**En quelques mots :** Qualifie les leads (vérifie le budget, l'urgence, le secteur), planifie des rendez-vous pour les closers, requalifie les leads disqualifiés. Dashboard avec leads à qualifier/planifier. Voit les leads non assignés et ceux qui lui sont assignés.

---

## 📊 Comparaison Rapide

| Rôle | Voit | Peut créer | Accès facturation |
|------|------|-----------|-------------------|
| **ADMIN** | Toutes les orgs | Tous les rôles | Non (interne) |
| **CEO** | Toute son org | Tous sauf ADMIN | ✅ Oui |
| **MANAGER** | Son équipe | Closers, Setters | ❌ Non |
| **CLOSER** | Ses leads/deals | Ses deals | ❌ Non |
| **SETTER** | Leads à qualifier | RDV pour closers | ❌ Non |

---

## 🎯 Hiérarchie des Permissions

```
ADMIN (interne KLOZD)
  └─ Accès à TOUT (toutes orgs)

CEO (propriétaire)
  └─ Accès complet à SON organisation
      ├─ MANAGER (gère équipes)
      │   ├─ CLOSER (ferme deals)
      │   └─ SETTER (qualifie leads)
      └─ Accès direct à tout
```

---

## 💡 En Pratique

- **CEO** : "Je veux voir tout ce qui se passe dans mon business"
- **MANAGER** : "Je veux gérer mon équipe et voir leurs performances"
- **CLOSER** : "Je veux voir mes appels du jour et fermer mes deals"
- **SETTER** : "Je veux qualifier les leads et planifier des RDV"



