# 🔧 MIGRATION PRISMA REQUISE - GUIDE

## ⚠️ Erreurs TypeScript Restantes

Toutes les erreurs TypeScript restantes sont liées aux **modèles Prisma manquants** dans le client généré. Ces modèles sont définis dans le schéma Prisma mais le client n'a pas encore été régénéré.

## 🚀 Actions Requises

### 1. Vérifier le Schéma Prisma

Vérifiez que les modèles suivants sont bien présents dans `apps/api/prisma/schema.prisma` :

- ✅ `RefreshToken` (pour l'authentification)
- ✅ `AuditLog` (pour l'audit trail)
- ✅ `IdempotencyKey` (pour l'idempotency)
- ✅ `MessageDelivery` (pour les notifications)
- ✅ Enums : `MessageProvider`, `MessageChannel`, `MessageDeliveryStatus`

### 2. Créer la Migration Prisma

```bash
cd apps/api
pnpm prisma migrate dev --name add_refresh_tokens_audit_logs_idempotency_message_delivery
```

Cette commande va :
- Créer les tables dans la base de données
- Générer le client Prisma avec les nouveaux modèles
- Résoudre toutes les erreurs TypeScript liées à ces modèles

### 3. Vérifier la Migration

Après la migration, vérifiez que :
- Les tables sont créées dans la base de données
- Le client Prisma est régénéré (`node_modules/.prisma/client`)
- Les erreurs TypeScript disparaissent

### 4. Si la Migration Échoue

Si la migration échoue (par exemple, si les tables existent déjà), vous pouvez :

**Option A : Reset et recréer (⚠️ DESTRUCTIF - uniquement en dev)**
```bash
cd apps/api
pnpm prisma migrate reset
pnpm prisma migrate dev --name add_refresh_tokens_audit_logs_idempotency_message_delivery
```

**Option B : Générer le client sans migration (si les tables existent déjà)**
```bash
cd apps/api
pnpm prisma generate
```

## 📋 Modèles Requis dans le Schéma

### RefreshToken
```prisma
model RefreshToken {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash     String
  createdAt     DateTime  @default(now())
  expiresAt     DateTime
  revokedAt     DateTime?
  replacedById  String?   @unique
  replacedBy    RefreshToken? @relation("RefreshTokenReplacement", fields: [replacedById], references: [id])
  previousToken RefreshToken? @relation("RefreshTokenReplacement")
  userAgent     String?   @db.Text
  ip            String?

  @@index([userId])
  @@index([expiresAt])
  @@index([revokedAt])
  @@map("refresh_tokens")
}
```

### AuditLog
```prisma
model AuditLog {
  id            String    @id @default(cuid())
  organizationId String
  actorUserId   String?
  actor         User?     @relation(fields: [actorUserId], references: [id])
  action        String
  entityType    String
  entityId      String
  beforeJson    String?   @db.Text
  afterJson     String?   @db.Text
  ip            String?
  userAgent     String?   @db.Text
  createdAt     DateTime  @default(now())

  @@index([organizationId])
  @@index([actorUserId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```

### IdempotencyKey
```prisma
model IdempotencyKey {
  id               String   @id @default(cuid())
  key              String
  scope            String
  requestHash      String
  responseStatus   Int
  responseJson     String   @db.Text
  status           String   @default("PENDING")
  createdAt        DateTime @default(now())
  expiresAt        DateTime
  organizationId   String?

  @@unique([key, scope])
  @@index([expiresAt])
  @@index([organizationId])
  @@index([status])
  @@map("idempotency_keys")
}
```

### MessageDelivery
```prisma
enum MessageProvider {
  EMAIL
  SMS
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
  BOUNCED
}

model MessageDelivery {
  id          String              @id @default(cuid())
  provider    MessageProvider
  channel     MessageChannel
  recipient   String
  subject     String?
  body        String              @db.Text
  status      MessageDeliveryStatus @default(PENDING)
  externalId  String?
  metadataJson String?            @db.Text
  sentAt      DateTime?
  deliveredAt DateTime?
  failedAt    DateTime?
  errorMessage String?            @db.Text
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  @@index([status])
  @@index([provider, channel])
  @@index([recipient])
  @@index([createdAt])
  @@map("message_deliveries")
}
```

## ✅ Après la Migration

Une fois la migration créée et le client régénéré, toutes les erreurs TypeScript suivantes devraient disparaître :

- ✅ `Property 'refreshToken' does not exist`
- ✅ `Property 'auditLog' does not exist`
- ✅ `Property 'idempotencyKey' does not exist`
- ✅ `Property 'messageDelivery' does not exist`
- ✅ `Module '"@prisma/client"' has no exported member 'MessageProvider'`
- ✅ `Module '"@prisma/client"' has no exported member 'MessageChannel'`
- ✅ `Module '"@prisma/client"' has no exported member 'MessageDeliveryStatus'`

## 🔍 Vérification

Pour vérifier que tout fonctionne :

```bash
cd apps/api
pnpm build
```

Si la compilation réussit sans erreurs TypeScript, c'est bon ! 🎉

---

**Note** : `cookie-parser` a déjà été installé, donc cette erreur est résolue.
