# Prisma Migration - Production Ready Setup

## ✅ Migration Created

**Migration folder**: `apps/api/prisma/migrations/20260114210000_add_auth_attempt_and_idempotency/`

**Migration file**: `migration.sql`

## Schema.prisma Verification

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

  @@unique([email, ip])  // ✅ Composite unique index
  @@index([email])        // ✅ Index for email lookups
  @@index([ip])           // ✅ Index for IP lookups
  @@index([lockedUntil])  // ✅ Index for cleanup queries
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

  @@unique([key, route])        // ✅ Unique constraint for idempotency
  @@index([expiresAt])           // ✅ Index for cleanup queries
  @@index([organizationId])      // ✅ Index for org-scoped queries
  @@map("idempotency_records")
}
```

## Migration SQL Summary

The migration creates:

1. **`auth_attempts` table**:
   - Primary key: `id`
   - Unique constraint: `(email, ip)`
   - Indexes: `email`, `ip`, `lockedUntil`

2. **`idempotency_records` table**:
   - Primary key: `id`
   - Unique constraint: `(key, route)`
   - Indexes: `expiresAt`, `organizationId`

**Full SQL**: See `apps/api/prisma/migrations/20260114210000_add_auth_attempt_and_idempotency/migration.sql`

## Commands

### Development (Local)

**Apply migrations**:
```bash
cd apps/api
pnpm prisma migrate dev
```

This will:
- Apply any pending migrations
- Generate Prisma Client automatically
- Update the database schema

**Check migration status**:
```bash
cd apps/api
pnpm prisma migrate status
```

**Reset database (⚠️ DESTROYS ALL DATA - DEV ONLY)**:
```bash
cd apps/api
pnpm prisma migrate reset
```

This will:
- Drop all tables
- Re-apply all migrations from scratch
- Run seed scripts if any (none currently)

### Production / CI

**Apply migrations** (safe, non-destructive):
```bash
cd apps/api
pnpm prisma migrate deploy
```

This will:
- Apply only pending migrations
- NOT generate Prisma Client (run separately if needed)
- NOT prompt for confirmation
- Safe for production use

**Generate Prisma Client** (after migrations):
```bash
cd apps/api
pnpm prisma generate
```

**Check migration status**:
```bash
cd apps/api
pnpm prisma migrate status
```

## Updated Documentation

### Files Updated

1. **`SETUP.md`**:
   - ✅ Updated to use `pnpm prisma migrate dev` instead of `prisma db push`
   - ✅ Added note about dev vs production commands

2. **`README.md`**:
   - ✅ Fixed migration command syntax

3. **`TASK_C_D_SUMMARY.md`**:
   - ✅ Updated migration reference from "db push" to proper migration name

4. **`MIGRATION_SETUP.md`**:
   - ✅ Created comprehensive migration guide

5. **`MIGRATION_FIX_SUMMARY.md`**:
   - ✅ Created summary of migration fix

### Removed References

- ❌ No references to `prisma db push` for these changes
- ✅ All documentation now uses `prisma migrate dev` (dev) or `prisma migrate deploy` (prod)

## CI/Production Deployment

### CI Pipeline Example

```yaml
# Example GitHub Actions / GitLab CI
- name: Apply Prisma Migrations
  run: |
    cd apps/api
    pnpm prisma migrate deploy
    
- name: Generate Prisma Client
  run: |
    cd apps/api
    pnpm prisma generate
```

### Production Deployment Steps

1. **Before deployment**:
   ```bash
   cd apps/api
   pnpm prisma migrate status
   ```
   Verify which migrations are pending.

2. **Apply migrations**:
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   ```

3. **Generate Prisma Client** (if not done automatically):
   ```bash
   cd apps/api
   pnpm prisma generate
   ```

4. **Verify**:
   ```bash
   cd apps/api
   pnpm prisma migrate status
   ```
   Should show: "Database schema is up to date!"

## Migration Workflow

### Creating New Migrations

1. **Modify schema**: Edit `apps/api/prisma/schema.prisma`
2. **Create migration**:
   ```bash
   cd apps/api
   pnpm prisma migrate dev --name descriptive_name
   ```
3. **Review SQL**: Check `prisma/migrations/YYYYMMDDHHMMSS_name/migration.sql`
4. **Test locally**: Migration is automatically applied
5. **Commit**: Include migration folder in version control
6. **Deploy**: Run `pnpm prisma migrate deploy` in production

### Never Use `prisma db push` in Production

- ❌ `prisma db push` - Development only, not tracked
- ✅ `prisma migrate dev` - Development, creates migration files
- ✅ `prisma migrate deploy` - Production, applies tracked migrations

## Current Migration Status

**Migration name**: `20260114210000_add_auth_attempt_and_idempotency`

**Status**: ✅ Applied and verified

**Tables created**:
- `auth_attempts` (with all indexes and constraints)
- `idempotency_records` (with all indexes and constraints)

## Verification Commands

```bash
# Check migration status
cd apps/api
pnpm prisma migrate status

# Verify tables exist
psql -d klozd -c "\dt auth_attempts idempotency_records"

# Verify indexes
psql -d klozd -c "\d auth_attempts"
psql -d klozd -c "\d idempotency_records"
```
