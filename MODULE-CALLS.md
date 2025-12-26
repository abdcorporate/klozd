# 📞 Module Calls - Visioconférence Native

## 🎯 Vue d'ensemble

Le module **Calls** permet de remplacer Zoom/Google Meet par une solution de visioconférence native hébergée, basée sur **LiveKit** (SFU WebRTC). Les calls sont liés aux **Appointments** existants et incluent l'enregistrement vidéo.

---

## 🗄️ Modèles Prisma

### `Call`
- **Lié à** : `Appointment` (1-1), `Organization`, `Lead` (optionnel)
- **Champs principaux** :
  - `roomName` : Identifiant de room côté SFU
  - `status` : `PENDING`, `ONGOING`, `COMPLETED`, `FAILED`, `CANCELLED`
  - `startedAt`, `endedAt`, `durationSeconds`
  - `recordingUrl` : URL finale de l'enregistrement (Object Storage)
  - `recordingData` : Métadonnées brutes du provider (JSON)

### `CallParticipant`
- **Lié à** : `Call`, `User` (optionnel pour guests)
- **Champs principaux** :
  - `userId`, `role`, `displayName`
  - `joinedAt`, `leftAt`, `totalSeconds`
  - `isHost`, `isGuest`

### Enum `CallStatus`
```prisma
enum CallStatus {
  PENDING
  ONGOING
  COMPLETED
  FAILED
  CANCELLED
}
```

---

## 🔧 Backend (NestJS)

### Structure du module

```
apps/api/src/calls/
├── calls.module.ts
├── calls.controller.ts
├── calls.service.ts
├── dto/
│   └── calls.dto.ts
└── services/
    └── livekit.service.ts
```

### Service LiveKit (`LivekitService`)

Encapsule les opérations LiveKit :
- `createRoomName(organizationId, appointmentId)` : Génère un nom de room stable
- `createAccessToken(params)` : Génère un token JWT pour l'accès
- `createRoom(roomName)` : Crée une room dans LiveKit
- `startRecording(roomName)` : Démarre l'enregistrement
- `stopRecording(recordingId)` : Arrête l'enregistrement
- `getServerUrl()` : Retourne l'URL du serveur LiveKit
- `isConfigured()` : Vérifie si LiveKit est configuré

### Endpoints API

#### 1. `POST /calls/appointments/:appointmentId/join`
**Authentifié** : JWT  
**Rôles autorisés** : CEO, MANAGER, CLOSER, SETTER, ADMIN

**Body** (optionnel) :
```json
{
  "displayName": "John Doe"
}
```

**Response** :
```json
{
  "callId": "clx...",
  "roomName": "org_xxx_apt_yyy",
  "token": "eyJ...",
  "livekitUrl": "wss://your-livekit-server.com",
  "appointment": {
    "id": "...",
    "lead": { ... },
    "closer": { ... },
    "scheduledAt": "..."
  }
}
```

**Logique** :
- Vérifie l'accès à l'appointment (permissions multi-tenant + rôles)
- Crée un `Call` s'il n'existe pas
- Crée la room dans LiveKit
- Crée/met à jour le `CallParticipant`
- Génère le token LiveKit
- Met à jour le statut du call (`PENDING` → `ONGOING` si premier participant)

#### 2. `POST /calls/:id/start`
**Authentifié** : JWT

**Body** (optionnel) :
```json
{
  "startRecording": true
}
```

**Logique** :
- Met à jour `status = ONGOING`
- Démarre l'enregistrement si demandé

#### 3. `POST /calls/:id/stop`
**Authentifié** : JWT

**Body** (optionnel) :
```json
{
  "reason": "Call ended"
}
```

**Logique** :
- Met à jour le participant (`leftAt`, `totalSeconds`)
- Si plus de participants actifs, marque le call comme `COMPLETED`
- Calcule `durationSeconds`

#### 4. `GET /calls/:id`
**Authentifié** : JWT

**Response** :
```json
{
  "id": "...",
  "status": "ONGOING",
  "roomName": "...",
  "appointment": { ... },
  "participants": [ ... ]
}
```

#### 5. `POST /webhooks/livekit` (Public)
**Webhook** pour les événements LiveKit (enregistrements)

**Body** :
```json
{
  "event": "recording_completed",
  "room": {
    "name": "org_xxx_apt_yyy"
  },
  "recording": {
    "id": "...",
    "url": "https://...",
    "duration": 3600
  }
}
```

**Logique** :
- Trouve le `Call` par `roomName`
- Met à jour `recordingUrl` et `recordingData`
- Calcule `durationSeconds` si disponible

**⚠️ Sécurité** : À sécuriser avec signature HMAC en production.

---

## 🖥️ Frontend (Next.js)

### Page de call

**Route** : `/app/call/[appointmentId]`

**Composant** : `apps/web/src/app/app/call/[appointmentId]/page.tsx`

**Fonctionnalités** :
1. Récupère `appointmentId` depuis les params
2. Vérifie l'authentification et les rôles autorisés
3. Appelle `POST /calls/appointments/:appointmentId/join`
4. Initialise `LiveKitRoom` avec le token
5. Affiche `VideoConference` (composant LiveKit)
6. Gère la déconnexion (appelle `POST /calls/:id/stop`)

**UI** :
- Header avec nom du lead et closer
- Bouton "Quitter" pour déconnexion
- Interface LiveKit complète (vidéo, audio, contrôles)

### Intégration dans la page Scheduling

**Fichier** : `apps/web/src/app/scheduling/page.tsx`

**Ajout** : Bouton "Rejoindre le call" pour chaque appointment

```tsx
<button
  onClick={() => router.push(`/app/call/${apt.id}`)}
  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
>
  Rejoindre le call
</button>
```

---

## 🔐 Permissions & Sécurité

### Rôles autorisés

- **CEO** : Accès à tous les appointments de son organisation
- **MANAGER** : Appointments de ses équipes
- **CLOSER** : Seulement ses appointments assignés
- **SETTER** : Appointments des leads qu'il a qualifiés
- **ADMIN** : Accès à tout (interne)

### Vérification d'accès

La fonction `canUserAccessAppointment()` dans `CallsService` vérifie :
1. L'existence de l'appointment
2. L'appartenance à la même organisation
3. Les permissions selon le rôle

---

## ⚙️ Configuration

### Variables d'environnement (Backend)

```env
# LiveKit (Native Video)
LIVEKIT_API_URL="wss://your-livekit-server.com"
LIVEKIT_API_KEY="..."
LIVEKIT_API_SECRET="..."
```

### Dépendances

**Backend** :
```json
{
  "livekit-server-sdk": "^2.15.0"
}
```

**Frontend** :
```json
{
  "@livekit/components-react": "^2.9.17",
  "@livekit/components-styles": "^1.2.0",
  "livekit-client": "^2.16.1"
}
```

---

## 📊 Flow Complet

### 1. Création d'un Appointment
- Un `Appointment` est créé via le module Scheduling
- Aucun `Call` n'est créé à ce stade

### 2. Rejoindre un Call
- L'utilisateur clique sur "Rejoindre le call" dans `/scheduling`
- Le frontend appelle `POST /calls/appointments/:id/join`
- Le backend :
  - Vérifie les permissions
  - Crée un `Call` (si inexistant)
  - Crée la room LiveKit
  - Génère le token
  - Crée le `CallParticipant`
- Le frontend initialise `LiveKitRoom` et se connecte

### 3. Pendant le Call
- Les participants peuvent rejoindre/quitter
- Le statut est `ONGOING`
- L'enregistrement peut être démarré (optionnel)

### 4. Fin du Call
- Le dernier participant quitte
- Le statut passe à `COMPLETED`
- `endedAt` et `durationSeconds` sont calculés

### 5. Enregistrement
- LiveKit envoie un webhook `recording_completed`
- Le backend met à jour `recordingUrl` et `recordingData`
- L'enregistrement est stocké sur Object Storage (configuré côté LiveKit)

---

## 🚀 Prochaines Étapes (TODO)

1. **Sécuriser le webhook** : Ajouter vérification HMAC signature
2. **Lien guest** : Permettre aux prospects externes de rejoindre via un lien public
3. **Notifications** : Notifier les participants avant/during/after le call
4. **Statistiques** : Dashboard avec métriques de calls (durée moyenne, taux de participation, etc.)
5. **Intégration Object Storage** : Configurer le stockage des enregistrements (S3, etc.)

---

## 📝 Notes Techniques

- **Room naming** : Format `org_{orgId}_apt_{appointmentId}` pour garantir l'unicité
- **Token expiration** : Les tokens LiveKit ont une durée de vie par défaut (à configurer si besoin)
- **Recording** : L'enregistrement est géré côté LiveKit, le webhook notifie le backend quand c'est prêt
- **Multi-tenant** : Tous les calls sont isolés par `organizationId`

---

## ✅ Fichiers Créés/Modifiés

### Backend
- ✅ `apps/api/prisma/schema.prisma` : Modèles `Call`, `CallParticipant`, enum `CallStatus`
- ✅ `apps/api/src/calls/` : Module complet (service, controller, DTOs, LiveKit service)
- ✅ `apps/api/src/app.module.ts` : Import de `CallsModule`
- ✅ `apps/api/src/main.ts` : Tag Swagger "Calls"
- ✅ `apps/api/prisma/migrations/20250115000000_add_calls_module/migration.sql`

### Frontend
- ✅ `apps/web/src/app/app/call/[appointmentId]/page.tsx` : Page de call
- ✅ `apps/web/src/app/scheduling/page.tsx` : Bouton "Rejoindre le call"
- ✅ `apps/web/src/lib/api.ts` : API `callsApi` ajoutée

### Documentation
- ✅ `MODULE-CALLS.md` : Ce document

---

## 🎉 Module Prêt !

Le module Calls est maintenant intégré et prêt à être utilisé. Il suffit de :
1. Configurer LiveKit (serveur SFU + variables d'environnement)
2. Tester avec un appointment existant
3. Vérifier l'enregistrement via le webhook




