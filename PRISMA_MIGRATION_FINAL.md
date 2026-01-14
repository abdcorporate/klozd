# Prisma Migration - Production Ready (Final)

## ✅ Migration Status

**Migration folder**: `apps/api/prisma/migrations/20260114210000_add_auth_attempt_and_idempotency/`

**Migration file**: `migration.sql` (51 lines)

**Status**: ✅ Created and applied

## Schema.prisma Verification

### ✅ AuthAttempt Model (lines 755-770)

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

  @@unique([email, ip])      // ✅ Composite unique constraint
  @@index([email])            // ✅ Index for email lookups
  @@index([ip])               // ✅ Index for IP lookups
  @@index([lockedUntil])      // ✅ Index for cleanup queries
  @@map("auth_attempts")
}
```

### ✅ IdempotencyRecord Model (lines 776-792)

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

## Migration SQL Content

**File**: `apps/api/prisma/migrations/20260114210000_add_auth_attempt_and_idempotency/migration.sql`

**Summary**:
- Creates `auth_attempts` table (13 lines)
- Creates `idempotency_records` table (13 lines)
- Creates unique constraint `auth_attempts_email_ip_key` (composite: email, ip)
- Creates unique constraint `idempotency_records_key_route_key` (composite: key, route)
- Creates 5 indexes total:
  - `auth_attempts_email_idx`
  - `auth_attempts_ip_idx`
  - `auth_attempts_lockedUntil_idx`
  - `idempotency_records_expiresAt_idx`
  - `idempotency_records_organizationId_idx`

**Full SQL** (51 lines):
```sql
-- CreateTable: auth_attempts
CREATE TABLE "auth_attempts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT,
    "failuresCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "auth_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: idempotency_records
CREATE TABLE "idempotency_records" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "responseStatus" INTEGER NOT NULL,
    "responseBodyJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,
    "ip" TEXT,
    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique constraint (email, ip)
CREATE UNIQUE INDEX "auth_attempts_email_ip_key" ON "auth_attempts"("email", "ip");

-- CreateIndex: email lookup
CREATE INDEX "auth_attempts_email_idx" ON "auth_attempts"("email");

-- CreateIndex: IP lookup
CREATE INDEX "auth_attempts_ip_idx" ON "auth_attempts"("ip");

-- CreateIndex: Cleanup queries
CREATE INDEX "auth_attempts_lockedUntil_idx" ON "auth_attempts"("lockedUntil");

-- CreateIndex: Unique constraint (key, route)
CREATE UNIQUE INDEX "idempotency_records_key_route_key" ON "idempotency_records"("key", "route");

-- CreateIndex: Cleanup queries
CREATE INDEX "idempotency_records_expiresAt_idx" ON "idempotency_records"("expiresAt");

-- CreateIndex: Org-scoped queries
CREATE INDEX "idempotency_records_organizationId_idx" ON "idempotency_records"("organizationId");
```

## Commands

### Development (Local)

**Apply migrations**:
```bash
cd apps/api
pnpm prisma migrate dev
```

**Check status**:
```bash
cd apps/api
pnpm prisma migrate status
```

**Reset database (⚠️ DEV ONLY - DESTROYS ALL DATA)**:
```bash
cd apps/api
pnpm prisma migrate reset
```

### Production / CI

**Apply migrations** (safe, non-destructive):
```bash
cd apps/api
pnpm prisma migrate deploy
```

**Generate Prisma Client** (after migrations):
```bash
cd apps/api
pnpm prisma generate
```

## Files Changed

### Documentation Updated

1. ✅ **`SETUP.md`**:
   - Uses `pnpm prisma migrate dev` (not `db push`)
   - Added note about dev vs production commands

2. ✅ **`README.md`**:
   - Fixed migration command syntax

3. ✅ **`TASK_C_D_SUMMARY.md`**:
   - Updated to reference proper migration name

4. ✅ **`MIGRATION_SETUP.md`**:
   - Comprehensive migration guide created

5. ✅ **`MIGRATION_FIX_SUMMARY.md`**:
   - Migration fix summary created

6. ✅ **`PRISMA_MIGRATION_PRODUCTION_READY.md`**:
   - Production-ready migration guide created

### No `db push` References

- ❌ No references to `prisma db push` for these changes
- ✅ All documentation uses `prisma migrate dev` (dev) or `prisma migrate deploy` (prod)

## CI/Production Deployment

### CI Pipeline Example

```yaml
# GitHub Actions / GitLab CI / CircleCI
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

1. **Check pending migrations**:
   ```bash
   cd apps/api
   pnpm prisma migrate status
   ```

2. **Apply migrations**:
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   ```

3. **Generate Prisma Client**:
   ```bash
   cd apps/api
   pnpm prisma generate
   ```

4. **Verify**:
   ```bash
   cd apps/api
   pnpm prisma migrate status
   # Should show: "Database schema is up to date!"
   ```

## Verification

**Current status**:
```bash
cd apps/api
pnpm prisma migrate status
# Output: "Database schema is up to date!"
```

**Verify tables exist** (if DB accessible):
```bash
psql -d klozd -c "\dt auth_attempts idempotency_records"
psql -d klozd -c "\d auth_attempts"
psql -d klozd -c "\d idempotency_records"
```

## Migration Workflow (Future)

1. Edit `apps/api/prisma/schema.prisma`
2. Create migration: `pnpm prisma migrate dev --name descriptive_name`
3. Review SQL in `prisma/migrations/YYYYMMDDHHMMSS_name/migration.sql`
4. Test locally (auto-applied)
5. Commit migration folder to version control
6. Deploy: `pnpm prisma migrate deploy` in production

## ✅ Confirmation

- ✅ Migration created: `20260114210000_add_auth_attempt_and_idempotency`
- ✅ Schema.prisma contains all required models with correct constraints
- ✅ All indexes and unique constraints included
- ✅ Documentation updated (no `db push` references)
- ✅ Commands provided for dev and production
- ✅ CI/production deployment instructions included
