# Waitlist Setup

## Migration Prisma

Pour créer la table `waitlist_entries` dans la base de données, exécutez :

```bash
cd apps/api
pnpm prisma migrate dev --name add_waitlist_entry
```

Ou utilisez le script automatisé :

```bash
cd apps/api
pnpm run prisma:setup-models
```

## Configuration

Aucune configuration supplémentaire requise. L'endpoint est public et utilise :
- Rate limiting : 5 requêtes/minute par IP
- Honeypot + timestamp validation (via `PublicEndpointSecurityService`)
- Détection IP client (via `IpDetectionService`)

## Endpoint

**POST** `/public/waitlist`

### Body

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "role": "infopreneur",
  "leadVolumeRange": "50-200",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "waitlist",
  "honeypot": "",
  "formRenderedAt": "2024-01-01T00:00:00.000Z"
}
```

### Response (nouvelle inscription)

```json
{
  "success": true,
  "message": "Inscription réussie",
  "alreadyJoined": false
}
```

### Response (déjà inscrit)

```json
{
  "success": true,
  "message": "already_joined",
  "alreadyJoined": true
}
```

## Email de confirmation

L'envoi d'email est actuellement un stub. Pour l'activer, décommentez le code dans `WaitlistService.sendWelcomeEmail()` et configurez `NotificationsService` avec Resend.

## Frontend

Le formulaire frontend (`apps/marketing/src/components/marketing/waitlist-form.tsx`) :
- Capture automatiquement les paramètres UTM depuis l'URL
- Inclut un champ honeypot invisible
- Inclut un timestamp `formRenderedAt`
- Gère les états loading, success, error
- Affiche un CTA "Accéder à l'app" après succès

## Variables d'environnement

Le frontend nécessite :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```
