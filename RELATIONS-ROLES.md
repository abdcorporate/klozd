# 🔗 Relations entre les Rôles - KLOZD

## 📊 Structure Hiérarchique

### Organisation créée par le CEO

**Important** : Tous les utilisateurs (CEO, Manager, Closer, Setter) appartiennent à la **même organisation** créée par le CEO lors de l'inscription.

```
Organisation (créée par le CEO)
  │
  ├── CEO (Créateur de l'organisation)
  │   │
  │   ├── MANAGER (Équipe 1)
  │   │   ├── CLOSER (Membre équipe 1)
  │   │   ├── CLOSER (Membre équipe 1)
  │   │   └── SETTER (Membre équipe 1)
  │   │
  │   ├── MANAGER (Équipe 2)
  │   │   ├── CLOSER (Membre équipe 2)
  │   │   └── SETTER (Membre équipe 2)
  │   │
  │   └── CLOSER (Sans équipe - attribution directe)
```

### Processus de Création

1. **Inscription** : Un CEO s'inscrit et crée une organisation
   ```typescript
   // auth.service.ts - register()
   const organization = await prisma.organization.create({
     data: {
       name: organizationName,
       users: {
         create: {
           email, password, firstName, lastName,
           role: 'CEO', // ← Premier utilisateur = CEO
         },
       },
     },
   });
   ```

2. **Création d'utilisateurs** : Le CEO (ou Manager) crée d'autres utilisateurs dans la même organisation
   ```typescript
   // users.service.ts - create()
   const user = await prisma.user.create({
     data: {
       email, password, firstName, lastName,
       role: 'CLOSER' | 'SETTER' | 'MANAGER',
       organizationId, // ← Même organisation que le CEO
     },
   });
   ```

## ✅ Oui, les Closers/Setters sont liés aux Managers/CEO

### Point Fondamental

**Tous les utilisateurs (CEO, Manager, Closer, Setter) appartiennent à la même organisation créée par le CEO.**

- Le CEO crée l'organisation lors de l'inscription
- Tous les autres utilisateurs sont créés dans cette même organisation (`User.organizationId`)
- Il n'y a pas de Closer/Setter indépendant : ils sont toujours dans une organisation avec un CEO

### 1. **Via les Équipes (Teams)**

#### Structure dans la Base de Données

```prisma
model Team {
  id             String
  name           String
  organizationId String
  managerId      String?  // ← Manager de l'équipe
  members        TeamMember[]  // ← Closers/Setters membres
}

model TeamMember {
  teamId String
  userId String  // ← Closer ou Setter
  role   String? // Rôle dans l'équipe
}
```

#### Relations

- **Manager** → Gère une ou plusieurs équipes (`Team.managerId`)
- **Closer/Setter** → Membre d'une équipe (`TeamMember`)
- **CEO** → Peut créer et gérer toutes les équipes

### 2. **Via l'Attribution des Leads**

#### Attribution Automatique

Quand un lead est qualifié :
- Il est automatiquement assigné à un **Closer** (via `Lead.assignedCloserId`)
- Il peut aussi être assigné à un **Setter** (via `Lead.assignedSetterId`)

#### Filtrage par Rôle

**Manager** :
- Voit les leads des membres de ses équipes
- Peut réassigner les leads de son équipe

**Closer** :
- Voit seulement ses propres leads assignés
- Ne voit pas les leads des autres closers

**Setter** :
- Voit les leads qu'il a qualifiés ou qui lui sont assignés

### 3. **Via les Permissions**

#### CEO
- ✅ Peut créer tous les rôles (sauf ADMIN)
- ✅ Voit toutes les données de l'organisation
- ✅ Gère toutes les équipes
- ✅ Crée et gère les formulaires

#### MANAGER
- ✅ Peut créer seulement **CLOSER** et **SETTER**
- ✅ Voit les données de ses équipes (`VIEW_TEAM_LEADS`, `VIEW_TEAM_DEALS`)
- ✅ Gère ses équipes (`MANAGE_TEAMS`)
- ✅ Peut réassigner les leads de son équipe

#### CLOSER
- ✅ Voit seulement ses propres leads (`VIEW_OWN_LEADS`)
- ✅ Gère ses propres deals (`MANAGE_DEALS`)
- ✅ Voit ses propres rendez-vous (`VIEW_OWN_APPOINTMENTS`)

#### SETTER
- ✅ Voit les leads qu'il a qualifiés
- ✅ Peut planifier des rendez-vous pour les closers
- ✅ Limité à la qualification et au scheduling

## 🔍 Exemples Concrets

### Exemple 1 : Création d'une Équipe

```typescript
// CEO ou MANAGER crée une équipe
const team = await teamsService.create(organizationId, userId, userRole, {
  name: "Équipe Ventes Paris",
  managerId: "manager-id", // ← Manager assigné
});

// Ajout de membres (Closers/Setters)
await teamsService.addMember(team.id, organizationId, userId, userRole, {
  userId: "closer-1-id", // ← Closer ajouté à l'équipe
  role: "CLOSER",
});
```

### Exemple 2 : Filtrage des Leads par Manager

```typescript
// Dans leads.service.ts
if (userRole === 'MANAGER') {
  // Récupérer les équipes gérées par ce manager
  const teams = await this.prisma.team.findMany({
    where: {
      organizationId,
      managerId: userId, // ← Manager de l'équipe
    },
    include: {
      members: {
        include: { user: true }, // ← Closers/Setters de l'équipe
      },
    },
  });

  // Filtrer les leads assignés aux membres de ses équipes
  const teamMemberIds = teams.flatMap(t => t.members.map(m => m.userId));
  where.assignedCloserId = { in: teamMemberIds };
}
```

### Exemple 3 : Attribution d'un Lead

```typescript
// Quand un lead est qualifié, il est assigné à un Closer
const closer = await attributionService.assignLeadToCloser(
  organizationId,
  lead
);

// Le lead est lié au Closer
await prisma.lead.update({
  where: { id: lead.id },
  data: { assignedCloserId: closer.id },
});
```

## 📋 Tableau Récapitulatif

| Rôle | Peut créer | Voit les données de | Gère |
|------|------------|---------------------|------|
| **CEO** | Tous (sauf ADMIN) | Toute l'organisation | Tout |
| **MANAGER** | CLOSER, SETTER | Son équipe | Son équipe |
| **CLOSER** | Rien | Ses propres leads/deals | Ses propres données |
| **SETTER** | Rien | Leads qu'il a qualifiés | Qualification + Scheduling |

## 🔗 Relations dans le Schéma Prisma

### User Model
```prisma
model User {
  // Manager: équipes qu'il gère
  managedTeams Team[] @relation("TeamManager")
  
  // Closer/Setter: équipes dont il est membre
  teams TeamMember[]
  
  // Leads assignés
  assignedLeads Lead[] @relation("AssignedCloser")
  assignedLeadsAsSetter Lead[] @relation("AssignedSetter")
  
  // Rendez-vous assignés
  assignedAppointments Appointment[] @relation("AssignedCloser")
}
```

### Team Model
```prisma
model Team {
  managerId String?  // ← Manager
  manager   User?    @relation("TeamManager")
  members   TeamMember[]  // ← Closers/Setters
}
```

## ⚠️ Cas Particuliers

### Closers/Setters sans Équipe

**Oui, c'est possible !**

- Un Closer peut être créé sans être assigné à une équipe
- L'attribution automatique des leads fonctionne quand même
- Le CEO peut voir tous les closers, même sans équipe
- Le Manager ne voit que les closers de son équipe

**Mais** : Même sans équipe, le Closer/Setter appartient toujours à l'organisation du CEO.

### Attribution Directe

- Les leads peuvent être assignés directement à un Closer (sans passer par une équipe)
- Le CEO peut réassigner n'importe quel lead
- Le Manager peut réassigner les leads de son équipe

## 🎯 Conclusion

**Oui, les Closers/Setters sont liés aux Managers/CEO** :

1. **Organisationnellement** : Tous appartiennent à la même organisation créée par le CEO
2. **Structurellement** : Via les équipes (Teams) - optionnel
3. **Fonctionnellement** : Via l'attribution des leads et le filtrage des données
4. **Hiérarchiquement** : Via les permissions et les droits d'accès

**Points clés** :
- ✅ Tous les utilisateurs (CEO, Manager, Closer, Setter) sont dans la même organisation
- ✅ Le CEO crée l'organisation lors de l'inscription
- ✅ Les Closers/Setters peuvent exister sans équipe, mais toujours dans l'organisation du CEO
- ✅ L'attribution des leads fonctionne même sans équipe
- ✅ Le CEO peut gérer directement tous les Closers/Setters de son organisation

---

**Version** : 1.0  
**Dernière mise à jour** : Décembre 2024

