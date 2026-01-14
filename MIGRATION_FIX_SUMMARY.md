# Migration Fix Summary - AuthAttempt & IdempotencyRecord

## Migration Created

**Migration folder**: `apps/api/prisma/migrations/20260114210000_add_auth_attempt_and_idempotency/`

**Files**:
- `migration.sql` - SQL migration script

## Schema.prisma Diff

The following models were added to `schema.prisma`:

```prisma
// ============================================
// AUTH SECURITY
// ============================================

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

// ============================================
// IDEMPOTENCY
// ============================================

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

## Commands to Apply

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

**Check migration status**:
```bash
cd apps/api
pnpm prisma migrate status
```

**Reset database (⚠️ DESTROYS ALL DATA)**:
```bash
cd apps/api
pnpm prisma migrate reset
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

## Updated Documentation

- `SETUP.md` - Updated to use `prisma migrate dev` instead of `prisma db push`
- `TASK_C_D_SUMMARY.md` - Updated migration reference
- `MIGRATION_SETUP.md` - Created comprehensive migration guide

## Migration SQL Content

The migration creates:
1. `auth_attempts` table with all indexes and constraints
2. `idempotency_records` table with all indexes and constraints

See `apps/api/prisma/migrations/20260114210000_add_auth_attempt_and_idempotency/migration.sql` for the full SQL.
