# Migration Setup - AuthAttempt & IdempotencyRecord

## Migration Created

**Migration folder**: `apps/api/prisma/migrations/20260114210000_add_auth_attempt_and_idempotency/`

**Files**:
- `migration.sql` - SQL migration script

## Schema Changes

The following models were added to `schema.prisma`:

### AuthAttempt Model
```prisma
model AuthAttempt {
  id            String    @id @default(cuid())
  email         String
  ip            String?
  failuresCount Int       @default(0)
  lockedUntil   DateTime?
  lastAttemptAt DateTime  @default(now())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([email, ip])
  @@index([email])
  @@index([ip])
  @@index([lockedUntil])
  @@map("auth_attempts")
}
```

### IdempotencyRecord Model
```prisma
model IdempotencyRecord {
  id               String   @id @default(cuid())
  key              String
  route            String
  requestHash      String
  responseStatus   Int
  responseBodyJson String   @db.Text
  createdAt        DateTime @default(now())
  expiresAt        DateTime
  organizationId   String?
  ip               String?

  @@unique([key, route])
  @@index([expiresAt])
  @@index([organizationId])
  @@map("idempotency_records")
}
```

## Commands

### Development (Local)

**Apply migrations**:
```bash
cd apps/api
pnpm prisma migrate dev
```

This will:
- Apply any pending migrations
- Generate Prisma Client
- Update the database schema

**Create a new migration**:
```bash
cd apps/api
pnpm prisma migrate dev --name your_migration_name
```

**Reset database (⚠️ DESTROYS ALL DATA)**:
```bash
cd apps/api
pnpm prisma migrate reset
```

**Check migration status**:
```bash
cd apps/api
pnpm prisma migrate status
```

### Production

**Apply migrations** (safe, non-destructive):
```bash
cd apps/api
pnpm prisma migrate deploy
```

This will:
- Apply only pending migrations
- NOT generate Prisma Client (run `pnpm prisma generate` separately if needed)
- NOT prompt for confirmation

**Generate Prisma Client** (after migrations):
```bash
cd apps/api
pnpm prisma generate
```

## Migration Workflow

1. **Make schema changes** in `apps/api/prisma/schema.prisma`
2. **Create migration**: `pnpm prisma migrate dev --name descriptive_name`
3. **Review migration SQL** in `prisma/migrations/YYYYMMDDHHMMSS_name/migration.sql`
4. **Test locally**: `pnpm prisma migrate dev` (applies and tests)
5. **Commit migration files** to version control
6. **Deploy to production**: `pnpm prisma migrate deploy`

## Current Migration

**Name**: `20260114210000_add_auth_attempt_and_idempotency`

**What it does**:
- Creates `auth_attempts` table for brute-force protection
- Creates `idempotency_records` table for idempotency handling
- Adds all required indexes and constraints

**To apply**:
```bash
cd apps/api
pnpm prisma migrate deploy
```
