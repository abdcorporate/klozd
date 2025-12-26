# 🏗️ Architecture - Module Calls (Visioconférence Native)

## 📋 Philosophie : Configuration Technique Cachée

**Principe fondamental** : Toute la configuration technique (LiveKit, Twilio, OpenAI, etc.) est gérée **uniquement côté backend** via variables d'environnement. Le client (CEO/Manager/Closer/Setter) ne voit **aucune configuration technique** dans l'interface.

### ✅ Ce que le client voit
- Bouton "Rejoindre l'appel" dans le planning
- Interface de visioconférence native
- Toggle "Activer l'enregistrement des appels" dans les paramètres (option produit, pas technique)
- Statistiques et métriques business

### ❌ Ce que le client ne voit PAS
- Clés API (LiveKit, Twilio, OpenAI, etc.)
- URLs de serveurs (LiveKit, etc.)
- Secrets et tokens
- Configuration d'infrastructure
- Paramètres techniques Zoom/Google Meet

---

## 🔧 Configuration Backend

### Variables d'environnement (`.env` backend uniquement)

```env
# LiveKit (Native Video)
LIVEKIT_API_URL="wss://your-livekit-server.com"
LIVEKIT_API_KEY="..."
LIVEKIT_API_SECRET="..."

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="..."

# Email (Resend/SendGrid)
RESEND_API_KEY="..."
SENDGRID_API_KEY="..."

# OpenAI
OPENAI_API_KEY="..."
```

**⚠️ Ces variables ne sont JAMAIS exposées dans l'UI client.**

---

## 🗄️ Modèles Prisma

### `Call`
```prisma
model Call {
  id              String     @id @default(cuid())
  organizationId  String
  appointmentId   String     @unique
  leadId          String?
  
  roomName        String     // Identifiant de room côté SFU (LiveKit)
  status          CallStatus @default(PENDING)
  
  startedAt       DateTime?
  endedAt         DateTime?
  durationSeconds Int?
  
  recordingUrl    String?    // URL finale de l'enregistrement
  recordingData   Json?      // Métadonnées brutes du provider
  
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  
  organization    Organization @relation(...)
  appointment     Appointment  @relation(...)
  lead            Lead?        @relation(...)
  participants    CallParticipant[]
}
```

### `CallParticipant`
```prisma
model CallParticipant {
  id          String    @id @default(cuid())
  callId      String
  userId      String?
  role        UserRole?
  displayName String?
  
  joinedAt    DateTime?
  leftAt      DateTime?
  totalSeconds Int?
  
  isHost      Boolean   @default(false)
  isGuest     Boolean   @default(false)
  
  call        Call      @relation(...)
  user        User?     @relation(...)
}
```

### `OrganizationSettings` (ajout)
```prisma
model OrganizationSettings {
  // ... autres champs ...
  
  // KLOZD Call (Native Video)
  callRecordingEnabled Boolean @default(true) // Option produit, pas technique
}
```

---

## 🔌 Backend - Module Calls

### Structure
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

### `LivekitService`

Encapsule toute la logique LiveKit :

```typescript
@Injectable()
export class LivekitService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly serverUrl: string;

  constructor(private configService: ConfigService) {
    // Lecture UNIQUEMENT depuis les variables d'environnement
    this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || '';
    this.serverUrl = this.configService.get<string>('LIVEKIT_API_URL') || '';
  }

  createAccessToken(params: { roomName: string; identity: string; metadata?: string }): string {
    // Génération de token JWT pour LiveKit
  }

  async startRecording(roomName: string): Promise<string> {
    // Démarrage de l'enregistrement (si callRecordingEnabled = true)
  }
}
```

**Aucune configuration n'est lue depuis la base de données ou l'UI client.**

### Endpoints API

#### `POST /calls/appointments/:appointmentId/join`
- **Authentifié** : JWT
- **Rôles** : CEO, MANAGER, CLOSER, SETTER, ADMIN
- **Logique** :
  1. Vérifie les permissions (multi-tenant + rôles)
  2. Crée un `Call` si absent
  3. Génère `roomName` stable : `org_{orgId}_apt_{appointmentId}`
  4. Génère token LiveKit via `LivekitService` (utilise les env vars)
  5. Crée/met à jour `CallParticipant`
  6. Démarre l'enregistrement automatiquement si `callRecordingEnabled = true`
  7. Retourne `{ roomName, token, livekitUrl, callId }`

**Le client ne voit que le résultat (token, URL), pas la configuration.**

#### `POST /webhooks/livekit`
- **Public** (protégé par signature HMAC en production)
- Reçoit les événements LiveKit (ex: `recording_completed`)
- Met à jour `Call.recordingUrl` et `Call.recordingData`

---

## 🖥️ Frontend - Page Call

### Route : `/app/call/[appointmentId]`

**Comportement** :
1. Récupère `appointmentId` depuis les params
2. Vérifie l'authentification (store auth)
3. Appelle `POST /calls/appointments/:appointmentId/join`
4. Reçoit `{ token, livekitUrl, roomName }`
5. Initialise `LiveKitRoom` avec le token
6. Affiche l'interface de visioconférence

**Aucun paramètre technique n'est visible par l'utilisateur.**

### Code simplifié
```tsx
'use client';

export default function CallPage({ params }: { params: { appointmentId: string } }) {
  const [callData, setCallData] = useState<{ token: string; livekitUrl: string } | null>(null);

  useEffect(() => {
    // Appel API backend (tout est géré côté serveur)
    callsApi.joinCall(appointmentId).then((response) => {
      setCallData(response.data);
    });
  }, [appointmentId]);

  if (!callData) return <div>Connexion...</div>;

  return (
    <LiveKitRoom token={callData.token} serverUrl={callData.livekitUrl}>
      <VideoConference />
    </LiveKitRoom>
  );
}
```

---

## ⚙️ Paramètres - Section "KLOZD Call"

### Page Settings (`/settings`)

**Section "KLOZD Call"** remplace toutes les configs techniques :

```tsx
<div className="bg-white shadow rounded-lg p-6">
  <h2>KLOZD Call</h2>
  
  {/* Toggle produit (pas technique) */}
  <div>
    <label>Enregistrement des appels</label>
    <input
      type="checkbox"
      checked={settings.callRecordingEnabled}
      onChange={(e) => {
        settingsApi.updateSettings({ callRecordingEnabled: e.target.checked });
      }}
    />
  </div>
  
  {/* Info business (pas technique) */}
  <p>Les enregistrements sont conservés 90 jours.</p>
</div>
```

**Ce qui a été retiré** :
- ❌ Section "Intégrations" avec Zoom/Twilio/SendGrid
- ❌ Champs de saisie de clés API
- ❌ URLs de serveurs
- ❌ Configuration technique

**Ce qui reste** :
- ✅ Toggle "Enregistrement des appels" (option produit)
- ✅ Info de rétention (texte statique)
- ✅ Statistiques business (futur)

---

## 🔄 Flow Complet

### 1. Création d'un Appointment
- Un `Appointment` est créé via le module Scheduling
- Aucun `Call` n'est créé à ce stade

### 2. Rejoindre un Call
1. L'utilisateur clique sur "Rejoindre l'appel" dans `/scheduling`
2. Le frontend appelle `POST /calls/appointments/:id/join`
3. Le backend :
   - Vérifie les permissions
   - Crée un `Call` (si inexistant)
   - Génère le token LiveKit (utilise les env vars backend)
   - Démarre l'enregistrement si `callRecordingEnabled = true`
   - Retourne `{ token, livekitUrl, roomName }`
4. Le frontend initialise `LiveKitRoom` et se connecte

### 3. Pendant le Call
- Les participants peuvent rejoindre/quitter
- Le statut est `ONGOING`
- L'enregistrement tourne en arrière-plan (si activé)

### 4. Fin du Call
- Le dernier participant quitte
- Le statut passe à `COMPLETED`
- `endedAt` et `durationSeconds` sont calculés

### 5. Enregistrement
- LiveKit envoie un webhook `recording_completed`
- Le backend met à jour `Call.recordingUrl` et `Call.recordingData`
- L'enregistrement est stocké sur Object Storage (configuré côté LiveKit)

---

## 🔐 Sécurité & Permissions

### Multi-tenant
- Tous les calls sont isolés par `organizationId`
- Un utilisateur ne peut accéder qu'aux calls de son organisation

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

## 📊 Statistiques & Métriques (Futur)

Le client pourra voir (dans les paramètres ou dashboard) :
- Nombre total de calls
- Durée moyenne des calls
- Taux de participation
- Nombre d'enregistrements disponibles
- **Aucune métrique technique** (latence, bande passante, etc.)

---

## 🚀 Déploiement

### Backend
1. Configurer les variables d'environnement dans `.env`
2. Déployer le serveur LiveKit (self-hosted ou cloud)
3. Configurer l'Object Storage pour les enregistrements (S3, etc.)
4. Configurer le webhook LiveKit vers `/webhooks/livekit`

### Frontend
1. Aucune configuration requise
2. Le frontend utilise uniquement `NEXT_PUBLIC_API_URL` pour appeler le backend

---

## ✅ Checklist de Conformité

- [x] Aucune clé API visible dans l'UI client
- [x] Aucune URL de serveur visible dans l'UI client
- [x] Toute la config technique dans les variables d'environnement backend
- [x] Section "KLOZD Call" simple avec uniquement des options produit
- [x] Module Calls utilise uniquement les env vars backend
- [x] Permissions multi-tenant et rôles correctement implémentées
- [x] Webhook LiveKit pour les enregistrements
- [x] Documentation de l'architecture

---

## 📝 Notes Techniques

- **Room naming** : Format `org_{orgId}_apt_{appointmentId}` pour garantir l'unicité
- **Token expiration** : Les tokens LiveKit ont une durée de vie par défaut (configurable côté backend)
- **Recording** : L'enregistrement est géré côté LiveKit, le webhook notifie le backend quand c'est prêt
- **Multi-tenant** : Tous les calls sont isolés par `organizationId`
- **Configuration** : Toute la config technique reste dans les `.env` backend, jamais dans la DB ou l'UI

---

## 🎯 Résumé

**Philosophie** : Le client clique sur "Rejoindre l'appel" et ça marche. Toute la complexité technique (LiveKit, tokens, enregistrement) est gérée par KLOZD côté backend, invisible pour le client.

**Avantages** :
- ✅ Expérience utilisateur simplifiée
- ✅ Sécurité renforcée (pas de clés API exposées)
- ✅ Maintenance facilitée (config centralisée)
- ✅ Scalabilité (gestion centralisée de l'infrastructure)




