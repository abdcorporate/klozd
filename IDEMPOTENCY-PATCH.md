# 🔒 PATCH COMPLET : IDEMPOTENCY RÉELLE

## 📋 RÉSUMÉ

Ce patch implémente une **idempotency réelle** pour :
1. **Partie A (HTTP)** : Les soumissions publiques de formulaires (`POST /leads/forms/:formId/submit`)
2. **Partie B (BullMQ)** : Les jobs de notifications (Email/SMS/WhatsApp)

## 🎯 PARTIE A : IDEMPOTENCY HTTP

### **Header Idempotency-Key obligatoire**

- ✅ Header `Idempotency-Key` **obligatoire** (sinon 400 Bad Request)
- ✅ Validation du format UUID v4
- ✅ Stockage serveur dans table `IdempotencyKey`

### **Table Prisma : `IdempotencyKey`**

```prisma
model IdempotencyKey {
  id               String   @id @default(cuid())
  key              String   // Idempotency-Key header value (UUID)
  scope            String   // Scope/route (e.g., "form_submit:formId")
  requestHash      String   // Hash SHA256 du body pour détection de conflit
  responseStatus   Int      // HTTP status code de la réponse stockée
  responseJson     String   @db.Text // JSON de la réponse stockée
  status           String   @default("PENDING") // PENDING, COMPLETED, FAILED
  createdAt        DateTime @default(now())
  expiresAt        DateTime // TTL: 24h (configurable via IDEMPOTENCY_TTL_HOURS)
  organizationId   String?  // Optionnel: pour idempotency scoped par org

  @@unique([key, scope])
  @@index([expiresAt])
  @@index([organizationId])
  @@index([status])
  @@map("idempotency_keys")
}
```

### **Comportement**

1. **Même key + même requestHash** → Renvoie la même `responseJson` (200)
2. **Même key + requestHash différent** → 409 Conflict
3. **TTL configurable** : 24h par défaut (variable d'environnement `IDEMPOTENCY_TTL_HOURS`)

### **Service : `IdempotencyService`**

**Méthodes principales** :
- `validateIdempotencyKey(key)` : Valide le format UUID v4, lance `BadRequestException` si invalide
- `checkIdempotency(key, scope, requestBody, organizationId?)` : Vérifie si une réponse existe déjà
- `storeResponse(key, scope, requestBody, responseStatus, responseBody, organizationId?)` : Stocke la réponse
- `cleanupExpired()` : Nettoie les enregistrements expirés

**Gestion des race conditions** :
- Utilise `$transaction` avec isolation level `Serializable`
- Gère les violations de contrainte unique (P2002)
- Détecte les replays et les conflits

## 🎯 PARTIE B : DÉDUPLICATION DES NOTIFICATIONS (BullMQ)

### **Table Prisma : `MessageDelivery`**

```prisma
enum MessageProvider {
  RESEND
  SENDGRID
  TWILIO
  WHATSAPP
}

enum MessageChannel {
  EMAIL
  SMS
  WHATSAPP
}

enum MessageDeliveryStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
}

model MessageDelivery {
  id                String                @id @default(cuid())
  provider          MessageProvider
  channel           MessageChannel
  to                String                 // Destinataire (email ou téléphone)
  template          String?                // Identifiant de template (optionnel)
  payloadHash       String                 // Hash SHA256 du payload pour déduplication
  status            MessageDeliveryStatus  @default(PENDING)
  providerMessageId String?                // ID externe (ex: Resend ID, Twilio SID)
  errorMessage      String?  @db.Text      // Message d'erreur si échec
  sentAt            DateTime?
  deliveredAt       DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  metadataJson      String?  @db.Text      // JSON avec métadonnées supplémentaires

  @@unique([provider, channel, to, payloadHash])
  @@index([status])
  @@index([channel])
  @@index([provider])
  @@index([createdAt])
  @@index([to])
  @@map("message_deliveries")
}
```

### **Service : `MessageDeliveryService`**

**Méthodes principales** :
- `checkDuplicate(provider, channel, to, payload)` : Vérifie si le message a déjà été envoyé
- `recordDelivery(data)` : Enregistre une tentative d'envoi, retourne `{ deliveryId, isDuplicate, status }`
- `markAsSent(deliveryId, providerMessageId?)` : Marque comme envoyé
- `markAsDelivered(deliveryId)` : Marque comme livré
- `markAsFailed(deliveryId, errorMessage)` : Marque comme échoué

**Déduplication** :
- Hash SHA256 du payload (to, message, from, etc.)
- Contrainte unique : `[provider, channel, to, payloadHash]`
- Si duplicate détecté → retourne le `deliveryId` existant sans réenvoyer

### **Intégration dans `NotificationsProcessor`**

**Avant l'envoi** :
1. Créer le payload (to, subject, html, etc.)
2. Appeler `recordDelivery()` pour vérifier les doublons
3. Si `isDuplicate === true` → retourner `true` sans envoyer
4. Sinon → envoyer via le service (EmailService, SmsService, WhatsappService)
5. Après envoi → `markAsSent()` avec `providerMessageId`

**Gestion des retries BullMQ** :
- Si un job retry avec le même payload → `isDuplicate === true` → pas de double envoi
- Logging : `deliveryId` + `providerMessageId` pour traçabilité

## 📁 FICHIERS MODIFIÉS/CRÉÉS

### **1. Schema Prisma** : `apps/api/prisma/schema.prisma`
- ✅ Renommé `IdempotencyRecord` → `IdempotencyKey`
- ✅ Ajouté champ `scope` (remplace `route`)
- ✅ Ajouté champ `status`
- ✅ Renommé `responseBodyJson` → `responseJson`
- ✅ Créé table `MessageDelivery` avec enums

### **2. Service Idempotency** : `apps/api/src/common/services/idempotency.service.ts`
- ✅ Mis à jour pour utiliser `IdempotencyKey` au lieu de `IdempotencyRecord`
- ✅ Utilise `scope` au lieu de `route`
- ✅ Ajouté méthode `validateIdempotencyKey()` pour validation UUID v4
- ✅ TTL configurable via `IDEMPOTENCY_TTL_HOURS` (défaut: 24h)

### **3. Nouveau Service** : `apps/api/src/notifications/services/message-delivery.service.ts`
- ✅ Service complet pour déduplication des notifications
- ✅ Gestion des race conditions avec contrainte unique
- ✅ Méthodes pour marquer les statuts (SENT, DELIVERED, FAILED)

### **4. Controller** : `apps/api/src/leads/leads.controller.ts`
- ✅ Header `Idempotency-Key` **obligatoire** (appel à `validateIdempotencyKey()`)
- ✅ Utilise `scope: "form_submit:${formId}"` au lieu de `route`
- ✅ Supprimé paramètre `ip` (non utilisé dans la nouvelle structure)

### **5. Processor** : `apps/api/src/notifications/jobs/notifications.processor.ts`
- ✅ Intégration de `MessageDeliveryService` dans `handleSendEmail()`, `handleSendSms()`, `handleSendWhatsApp()`
- ✅ Vérification de déduplication avant chaque envoi
- ✅ Enregistrement du `deliveryId` et `providerMessageId` après envoi

### **6. Module** : `apps/api/src/notifications/notifications.module.ts`
- ✅ Ajouté `MessageDeliveryService` aux providers

### **7. Tests E2E** : `apps/api/test/integration/idempotency.e2e-spec.ts`
- ✅ Test 1 : Header `Idempotency-Key` obligatoire (400 si absent)
- ✅ Test 2 : Header `Idempotency-Key` doit être UUID v4 (400 si invalide)
- ✅ Test 3 : Même requête avec même clé → même réponse (200)
- ✅ Test 4 : Même clé avec body différent → 409 Conflict

## 🧪 TESTS E2E

### **Test 1 : Header obligatoire**
```typescript
it('should return 400 when Idempotency-Key header is missing', async () => {
  const response = await request(httpServer)
    .post(`/leads/forms/${form.id}/submit`)
    .send({ email: 'test@example.com', ... })
    .expect(400);
  expect(response.body.message).toContain('Idempotency-Key header is required');
});
```

### **Test 2 : Format UUID v4**
```typescript
it('should return 400 when Idempotency-Key is not a valid UUID v4', async () => {
  const response = await request(httpServer)
    .post(`/leads/forms/${form.id}/submit`)
    .set('Idempotency-Key', 'invalid-key')
    .send({ ... })
    .expect(400);
  expect(response.body.message).toContain('Idempotency-Key must be a valid UUID v4');
});
```

### **Test 3 : Même réponse pour même requête**
```typescript
it('should return the same response for identical requests with same Idempotency-Key', async () => {
  const idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';
  
  // First request
  const firstResponse = await request(httpServer)
    .post(`/leads/forms/${form.id}/submit`)
    .set('Idempotency-Key', idempotencyKey)
    .send(submitData)
    .expect(200);
  
  // Second request with same key and same body
  const secondResponse = await request(httpServer)
    .post(`/leads/forms/${form.id}/submit`)
    .set('Idempotency-Key', idempotencyKey)
    .send(submitData)
    .expect(200);
  
  // Should return the same response
  expect(secondResponse.body.lead.id).toBe(firstResponse.body.lead.id);
  
  // Verify only one lead was created
  const leads = await prisma.lead.findMany({ where: { email: submitData.email } });
  expect(leads).toHaveLength(1);
});
```

### **Test 4 : Conflit avec body différent**
```typescript
it('should return 409 Conflict when same Idempotency-Key is used with different request body', async () => {
  const idempotencyKey = '550e8400-e29b-41d4-a716-446655440001';
  
  // First request
  await request(httpServer)
    .post(`/leads/forms/${form.id}/submit`)
    .set('Idempotency-Key', idempotencyKey)
    .send({ email: 'test@example.com', data: { budget: '3000' } })
    .expect(200);
  
  // Second request with same key but different body
  const conflictResponse = await request(httpServer)
    .post(`/leads/forms/${form.id}/submit`)
    .set('Idempotency-Key', idempotencyKey)
    .send({ email: 'test@example.com', data: { budget: '10000' } }) // Different
    .expect(409);
  
  expect(conflictResponse.body.message).toContain('Idempotency-Key conflict');
});
```

## 🚀 DÉPLOIEMENT

### **1. Migration Prisma**

```bash
cd apps/api
pnpm prisma migrate dev --name add_idempotency_and_message_delivery
```

Cette migration va :
- Renommer `idempotency_records` → `idempotency_keys`
- Ajouter colonnes `scope`, `status` (supprimer `route`, `ip`)
- Renommer `responseBodyJson` → `responseJson`
- Créer table `message_deliveries` avec enums

### **2. Variables d'environnement**

```env
# TTL pour idempotency (optionnel, défaut: 24h)
IDEMPOTENCY_TTL_HOURS=24
```

### **3. Vérifications**

1. ✅ Tous les imports sont corrects
2. ✅ `MessageDeliveryService` ajouté au module
3. ✅ Tests E2E passent : `pnpm test:e2e:local`
4. ✅ Pas d'erreurs de lint

## 📊 COUVERTURE

### **Partie A (HTTP)**
- ✅ Header obligatoire
- ✅ Validation UUID v4
- ✅ Stockage dans `IdempotencyKey`
- ✅ Détection de conflit (même key + body différent)
- ✅ Retour de réponse stockée (même key + même body)
- ✅ TTL configurable
- ✅ Nettoyage automatique des enregistrements expirés

### **Partie B (BullMQ)**
- ✅ Table `MessageDelivery` avec contrainte unique
- ✅ Déduplication basée sur `[provider, channel, to, payloadHash]`
- ✅ Gestion des retries (pas de double envoi)
- ✅ Logging `deliveryId` + `providerMessageId`
- ✅ Statuts : PENDING → SENT → DELIVERED/FAILED

## ⚠️ POINTS D'ATTENTION

### **1. Migration de données**
- Les enregistrements existants dans `idempotency_records` doivent être migrés
- Script de migration optionnel pour convertir `route` → `scope`

### **2. Provider Message IDs**
- Les services `EmailService`, `SmsService`, `WhatsappService` devraient retourner `providerMessageId`
- Actuellement, on marque comme SENT sans `providerMessageId` (à améliorer)

### **3. TTL**
- Les enregistrements expirés sont nettoyés à la volée dans `checkIdempotency()`
- Cron job optionnel pour nettoyage périodique

### **4. Performance**
- Index sur `[key, scope]`, `[expiresAt]`, `[organizationId]`
- Index sur `[provider, channel, to, payloadHash]` pour `MessageDelivery`

## ✅ VALIDATION

- [x] Schema Prisma mis à jour
- [x] `IdempotencyService` mis à jour
- [x] `MessageDeliveryService` créé
- [x] Controller mis à jour (header obligatoire)
- [x] Processor mis à jour (déduplication)
- [x] Module mis à jour
- [x] Tests E2E créés (4 tests)
- [x] Pas d'erreurs de lint

## 🔄 PROCHAINES ÉTAPES (Optionnel)

1. **Améliorer les services d'envoi** : Retourner `providerMessageId` dans `EmailService`, `SmsService`, `WhatsappService`
2. **Cron job de nettoyage** : Nettoyer périodiquement les enregistrements expirés
3. **Métriques** : Ajouter des métriques pour taux de déduplication, conflits, etc.
4. **Webhooks** : Utiliser `MessageDelivery` pour tracker les webhooks de livraison (ex: Resend webhooks)

---

**Date** : 2025-01-27  
**Auteur** : Patch d'idempotency réelle  
**Version** : 1.0.0
