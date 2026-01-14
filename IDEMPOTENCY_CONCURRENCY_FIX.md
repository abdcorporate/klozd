# Idempotency Concurrency Hardening

## Changes Made

### 1. Enhanced `storeResponse` with Transaction-Based Race Condition Handling

**File**: `apps/api/src/common/services/idempotency.service.ts`

**Changes**:
- Replaced `upsert` with explicit `create` inside a transaction
- Added `Serializable` isolation level for maximum concurrency safety
- Added unique constraint violation handling (P2002 error code)
- On unique violation, re-fetches existing record and applies replay/conflict rules

**Key improvements**:
1. **Transaction isolation**: Uses `Serializable` isolation level to prevent phantom reads
2. **Race condition handling**: Catches `P2002` (unique constraint violation) and handles gracefully
3. **Replay detection**: If same key+route+hash exists, returns silently (idempotent replay)
4. **Conflict detection**: If same key+route but different hash, throws `ConflictException`
5. **Expired record handling**: Deletes expired records and retries once

### 2. Unique Constraint Verification

**File**: `apps/api/prisma/schema.prisma`

**Status**: ✅ Already present
- `@@unique([key, route])` constraint exists (line 788)
- Enforced at database level

### 3. Concurrency Test

**File**: `apps/api/src/common/services/idempotency.service.spec.ts`

**Test cases**:
1. **Concurrent requests test**: Simulates two simultaneous requests with `Promise.all` and verifies only one write occurs
2. **Conflict detection test**: Verifies `ConflictException` is thrown when same key+route has different request hash
3. **Expired record handling test**: Tests cleanup and retry logic for expired records

## Code Diff

### `idempotency.service.ts` - `storeResponse` method

```typescript
// BEFORE: Simple upsert
await this.prisma.idempotencyRecord.upsert({
  where: { key_route: { key, route } },
  create: { ... },
  update: { ... },
});

// AFTER: Transaction with race condition handling
try {
  await this.prisma.$transaction(
    async (tx) => {
      await tx.idempotencyRecord.create({
        data: { key, route, requestHash, ... },
      });
    },
    { isolationLevel: 'Serializable' },
  );
} catch (error: any) {
  if (error.code === 'P2002' || error.meta?.target?.includes('key_route')) {
    // Handle unique violation: re-fetch and apply replay/conflict rules
    const existing = await this.prisma.idempotencyRecord.findUnique({ ... });
    // Apply rules based on existing record
  }
}
```

## Test Instructions

### Run the concurrency test

```bash
cd apps/api
pnpm test -- idempotency.service.spec
```

### Expected output

```
PASS  src/common/services/idempotency.service.spec.ts
  IdempotencyService
    storeResponse - concurrency handling
      ✓ should handle concurrent requests and ensure only one write occurs
      ✓ should throw ConflictException when same key+route has different request hash
      ✓ should handle expired records in race condition
    checkIdempotency
      ✓ should return stored response for same key+route+hash
      ✓ should return null for non-existent key

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

### Manual concurrency test (optional)

To test with real database:

```bash
# Start API
cd apps/api
pnpm start:dev

# In another terminal, run concurrent requests
IDEMPOTENCY_KEY=$(uuidgen)
for i in {1..10}; do
  curl -X POST http://localhost:3001/leads/forms/FORM_ID/submit \
    -H "Content-Type: application/json" \
    -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
    -d '{"email":"test@example.com","data":{}}' &
done
wait

# Check database - should have only ONE record
psql -d klozd -c "SELECT COUNT(*) FROM idempotency_records WHERE key = '$IDEMPOTENCY_KEY';"
```

## How It Works

### Scenario 1: Concurrent Requests (Same Body)

1. **Request A** starts transaction, attempts `create`
2. **Request B** starts transaction, attempts `create` → **P2002 error** (unique violation)
3. **Request B** catches error, re-fetches existing record
4. **Request B** verifies same `requestHash` → returns silently (replay)
5. **Result**: Only one record created, both requests succeed

### Scenario 2: Concurrent Requests (Different Body)

1. **Request A** creates record with hash `abc123`
2. **Request B** attempts create with hash `xyz789` → **P2002 error**
3. **Request B** re-fetches, finds hash `abc123` (different)
4. **Request B** throws `ConflictException`
5. **Result**: One record created, second request fails with 409

### Scenario 3: Expired Record

1. **Request A** finds expired record, deletes it
2. **Request A** retries `create` → succeeds
3. **Result**: Expired record cleaned up, new record created

## Database Constraints

The unique constraint `(key, route)` is enforced at the database level:

```sql
CREATE UNIQUE INDEX "idempotency_records_key_route_key" 
ON "idempotency_records"("key", "route");
```

This ensures that even without application-level locking, the database prevents duplicate inserts.

## Isolation Level: Serializable

Using `Serializable` isolation level provides:
- **Highest consistency**: Prevents phantom reads, non-repeatable reads, and dirty reads
- **Concurrency safety**: Ensures transactions are serialized (executed one at a time)
- **Trade-off**: May cause more transaction retries under high concurrency, but guarantees correctness

For idempotency records (low write volume, high correctness requirement), this is the right choice.
