# Guide de Configuration des Intégrations Externes

Ce document explique comment configurer les intégrations externes de KLOZD.

## 📹 Visioconférence

### Zoom

1. Créez une application OAuth dans le [Zoom Marketplace](https://marketplace.zoom.us/)
2. Récupérez votre **API Key** et **API Secret**
3. (Optionnel) Récupérez votre **Account ID** pour Server-to-Server OAuth

Ajoutez dans votre `.env` :
```env
ZOOM_API_KEY=votre_api_key
ZOOM_API_SECRET=votre_api_secret
ZOOM_ACCOUNT_ID=votre_account_id  # Optionnel
```

### Google Meet

1. Créez un projet dans [Google Cloud Console](https://console.cloud.google.com/)
2. Activez l'API **Google Calendar API**
3. Créez des identifiants OAuth 2.0 (Application type: Web application)
4. Configurez l'écran de consentement OAuth
5. Générez un **Refresh Token** en utilisant le flow OAuth

Ajoutez dans votre `.env` :
```env
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_REFRESH_TOKEN=votre_refresh_token
```

**Note** : Pour générer un refresh token, suivez [ce guide](https://developers.google.com/identity/protocols/oauth2/web-server#offline).

## 📧 Email

### Resend (Recommandé)

1. Créez un compte sur [Resend](https://resend.com/)
2. Vérifiez votre domaine (ou utilisez le domaine de test)
3. Récupérez votre **API Key**

Ajoutez dans votre `.env` :
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@votredomaine.com
```

### SendGrid (Alternative)

1. Créez un compte sur [SendGrid](https://sendgrid.com/)
2. Créez une **API Key** avec les permissions "Mail Send"
3. Vérifiez votre domaine d'envoi

Ajoutez dans votre `.env` :
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@votredomaine.com
```

**Note** : Resend est utilisé par défaut si les deux sont configurés.

## 📱 SMS et WhatsApp

### Twilio

1. Créez un compte sur [Twilio](https://www.twilio.com/)
2. Récupérez votre **Account SID** et **Auth Token**
3. Achetez un numéro de téléphone pour SMS
4. (Pour WhatsApp) Configurez WhatsApp Business API via Twilio

Ajoutez dans votre `.env` :
```env
# Configuration Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=votre_auth_token

# Numéro de téléphone pour SMS
TWILIO_PHONE_NUMBER=+33612345678

# Numéro WhatsApp (format: whatsapp:+33612345678)
TWILIO_WHATSAPP_NUMBER=whatsapp:+33612345678
```

**Note** : Les numéros doivent être au format international avec le préfixe `+`.

## 🔧 Configuration dans le Code

### Visioconférence

Lors de la création d'un rendez-vous, spécifiez le provider :

```typescript
{
  scheduledAt: "2024-01-15T10:00:00Z",
  duration: 30,
  visioProvider: "ZOOM" | "GOOGLE_MEET" | "CUSTOM"
}
```

Si `visioProvider` est `ZOOM` ou `GOOGLE_MEET` et qu'aucune `visioUrl` n'est fournie, une réunion sera automatiquement créée.

### Email

Le service email détecte automatiquement le provider configuré (Resend ou SendGrid) et l'utilise pour tous les envois.

### SMS/WhatsApp

Les services SMS et WhatsApp utilisent automatiquement Twilio si configuré. Sinon, les messages sont loggés mais non envoyés.

## 🧪 Test des Intégrations

### Tester Zoom
1. Créez un rendez-vous avec `visioProvider: "ZOOM"`
2. Vérifiez que `visioUrl` et `visioMeetingId` sont générés
3. Testez le lien de réunion

### Tester Email
1. Créez un rendez-vous (un email de confirmation sera envoyé)
2. Vérifiez les logs pour confirmer l'envoi
3. Vérifiez votre boîte de réception

### Tester SMS
1. Créez un rendez-vous avec un numéro de téléphone valide
2. Un SMS de rappel sera envoyé automatiquement (J-1, H-1)
3. Vérifiez les logs Twilio

### Tester WhatsApp
1. Assurez-vous que le numéro est vérifié dans Twilio
2. Envoyez un message WhatsApp via l'API
3. Vérifiez les logs Twilio

## ⚠️ Notes Importantes

- **Sécurité** : Ne commitez jamais vos clés API dans le repository
- **Coûts** : Toutes ces intégrations peuvent avoir des coûts associés
- **Limites** : Respectez les limites de taux de chaque service
- **Fallback** : Si une intégration n'est pas configurée, le système continue de fonctionner mais les fonctionnalités correspondantes sont désactivées

## 📚 Documentation Externe

- [Zoom API Documentation](https://marketplace.zoom.us/docs/api-reference/zoom-api)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [Resend Documentation](https://resend.com/docs)
- [SendGrid API](https://docs.sendgrid.com/api-reference)
- [Twilio API](https://www.twilio.com/docs)




