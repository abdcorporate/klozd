# Task C + D Implementation Summary

## Task C: Rate Limiting / Anti-abuse

### C1: Global Throttler Configuration
**File**: `apps/api/src/app.module.ts`

**Configuration**:
- Global limit: **100 requests per minute** (conservative default)
- TTL: 60 seconds (1 minute)

### C2: Per-Route Throttling
**Applied to**:
- `POST /auth/login`: **10 requests/minute**
- `POST /auth/register`: **5 requests/minute**
- `POST /auth/resend-verification`: **3 requests/minute**
- `GET /forms/public/:slug`: **30 requests/minute**
- `POST /leads/forms/:formId/submit`: **10 requests/minute**
- `POST /scheduling/appointments/public`: **10 requests/minute**

### C3: DB-Backed Brute-Force Protection
**Model**: `AuthAttempt` (Prisma)
- Fields: `id`, `email`, `ip`, `failuresCount`, `lockedUntil`, `lastAttemptAt`, `createdAt`, `updatedAt`
- Unique constraint: `(email, ip)`
- Indexes: `email`, `ip`, `lockedUntil`

**Configuration**:
- Max failures: **5** (configurable via `BRUTE_FORCE_MAX_FAILURES`)
- Lock duration: **15 minutes** (configurable via `BRUTE_FORCE_LOCK_DURATION_MINUTES`)

**Behavior**:
- Records failure on invalid login (even if email doesn't exist - prevents enumeration)
- Locks account after 5 failures for 15 minutes
- Resets failures on successful login
- Returns generic error message: "Email ou mot de passe incorrect" (no email enumeration)

**Service**: `apps/api/src/auth/services/brute-force.service.ts`
**Integration**: `apps/api/src/auth/auth.service.ts` (login method)

---

## Task D: Idempotency for Public Posts

### D1: IdempotencyRecord Model
**Model**: `IdempotencyRecord` (Prisma)
- Fields:
  - `id` (cuid)
  - `key` (Idempotency-Key header value, UUID)
  - `route` (e.g., "/leads/forms/:formId/submit")
  - `requestHash` (SHA256 hash of request body)
  - `responseStatus` (HTTP status code)
  - `responseBodyJson` (JSON string of stored response)
  - `createdAt`
  - `expiresAt` (TTL: 24 hours)
  - `organizationId` (nullable, for org-scoped idempotency)
  - `ip` (optional, for logging)
- Unique constraint: `(key, route)`
- Indexes: `expiresAt`, `organizationId`

### D2: Idempotency Logic
**Service**: `apps/api/src/common/services/idempotency.service.ts`

**Behavior**:
- Same `key + route + hash` within TTL (24h) => return stored response, no duplicate writes
- Same `key + route` but different `hash` => **409 Conflict**
- Expired records are automatically cleaned up

**Applied to**:
- `POST /leads/forms/:formId/submit` (`apps/api/src/leads/leads.controller.ts`)
- `POST /scheduling/appointments/public` (`apps/api/src/scheduling/scheduling.controller.ts`)

### D3: Frontend Integration
**Updated files**:
- `apps/web/src/lib/api.ts`: Updated `formsApi.submit()` and `schedulingApi.createPublic()` to accept optional `idempotencyKey` parameter
- `apps/web/src/app/pages/public/[slug]/page.tsx`: Generates UUID and sends as `Idempotency-Key` header
- `apps/web/src/app/book/[leadId]/page.tsx`: Generates UUID and sends as `Idempotency-Key` header

**Implementation**:
```typescript
// Generate idempotency key
const idempotencyKey = crypto.randomUUID();
await formsApi.submit(formId, data, idempotencyKey);
```

---

## Migration

**Applied via**: Prisma migrations
**Migration name**: `20260114210000_add_auth_attempt_and_idempotency`

**Models added**:
1. `AuthAttempt` → `auth_attempts` table
2. `IdempotencyRecord` → `idempotency_records` table

---

## Validation Commands

### 1. Test Throttling (POST /auth/login)
```bash
# Should succeed
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'

# Repeat 11 times quickly - should get 429 Too Many Requests
for i in {1..11}; do
  curl -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo ""
done
```

### 2. Test Brute-Force Lockout
```bash
# Attempt 5 failed logins - should lock account
for i in {1..5}; do
  curl -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo ""
done

# 6th attempt should return lockout message
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'
```

### 3. Test Idempotency Replay (Same Request)
```bash
IDEMPOTENCY_KEY=$(uuidgen)

# First request - should create lead
curl -X POST http://localhost:3001/leads/forms/FORM_ID/submit \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{"email":"test@example.com","data":{}}'

# Second request with same key - should return same response (no duplicate)
curl -X POST http://localhost:3001/leads/forms/FORM_ID/submit \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{"email":"test@example.com","data":{}}'
```

### 4. Test Idempotency Conflict (Different Body)
```bash
IDEMPOTENCY_KEY=$(uuidgen)

# First request
curl -X POST http://localhost:3001/leads/forms/FORM_ID/submit \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{"email":"test1@example.com","data":{}}'

# Second request with same key but different body - should return 409
curl -X POST http://localhost:3001/leads/forms/FORM_ID/submit \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{"email":"test2@example.com","data":{}}'
```

### 5. Test Public Appointment Booking Idempotency
```bash
IDEMPOTENCY_KEY=$(uuidgen)

# First booking
curl -X POST http://localhost:3001/scheduling/appointments/public \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{"leadId":"LEAD_ID","assignedCloserId":"CLOSER_ID","scheduledAt":"2024-01-15T10:00:00Z","duration":30}'

# Replay - should return same response
curl -X POST http://localhost:3001/scheduling/appointments/public \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{"leadId":"LEAD_ID","assignedCloserId":"CLOSER_ID","scheduledAt":"2024-01-15T10:00:00Z","duration":30}'
```

---

## Files Modified

### Backend
- `apps/api/prisma/schema.prisma` - Added `AuthAttempt` and `IdempotencyRecord` models
- `apps/api/src/app.module.ts` - Updated throttler config
- `apps/api/src/auth/auth.controller.ts` - Added throttling decorators, IP extraction
- `apps/api/src/auth/auth.service.ts` - Integrated brute-force protection
- `apps/api/src/auth/auth.module.ts` - Added `BruteForceService`
- `apps/api/src/auth/services/brute-force.service.ts` - **NEW** - Brute-force protection service
- `apps/api/src/common/common.module.ts` - **NEW** - Common module for shared services
- `apps/api/src/common/services/idempotency.service.ts` - **NEW** - Idempotency service
- `apps/api/src/leads/leads.controller.ts` - Added idempotency handling
- `apps/api/src/leads/leads.module.ts` - Added `CommonModule` import
- `apps/api/src/scheduling/scheduling.controller.ts` - Added idempotency handling, throttling
- `apps/api/src/scheduling/scheduling.module.ts` - Added `CommonModule` import
- `apps/api/src/forms/forms.controller.ts` - Added throttling for public endpoint

### Frontend
- `apps/web/src/lib/api.ts` - Updated `formsApi.submit()` and `schedulingApi.createPublic()` to support idempotency key
- `apps/web/src/app/pages/public/[slug]/page.tsx` - Generates and sends `Idempotency-Key`
- `apps/web/src/app/book/[leadId]/page.tsx` - Generates and sends `Idempotency-Key`

---

## Configuration Values

### Throttling
- **Global**: 100 req/min
- **POST /auth/login**: 10 req/min
- **POST /auth/register**: 5 req/min
- **POST /auth/resend-verification**: 3 req/min
- **GET /forms/public/:slug**: 30 req/min
- **POST /leads/forms/:formId/submit**: 10 req/min
- **POST /scheduling/appointments/public**: 10 req/min

### Brute-Force Protection
- **Max failures**: 5 (configurable via `BRUTE_FORCE_MAX_FAILURES`)
- **Lock duration**: 15 minutes (configurable via `BRUTE_FORCE_LOCK_DURATION_MINUTES`)

### Idempotency
- **TTL**: 24 hours
- **Hash algorithm**: SHA256
