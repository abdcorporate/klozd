# Pagination Implementation: GET /scheduling/appointments

## 1. Default orderBy fields (including tie-breaker)

**Location**: `apps/api/src/scheduling/scheduling.service.ts:218-221`

```typescript
const defaultOrderBy = sortBy === 'scheduledAt'
  ? { scheduledAt: sortOrder, id: sortOrder }
  : { createdAt: 'desc', id: 'desc' };
const orderBy = buildOrderBy(sortBy, sortOrder, defaultOrderBy);
```

**When `sortBy=scheduledAt` (default)**:
- Primary field: `scheduledAt: 'asc'` (default sortOrder)
- Tie-breaker: `id: 'asc'` (default sortOrder)

**Result**: `{ scheduledAt: 'asc', id: 'asc' }`

## 2. Cursor payload fields used when sortBy=scheduledAt

**Location**: `apps/api/src/common/pagination/pagination.util.ts:126-153`

The `extractCursor` function creates cursor payload:
```typescript
{
  id: item.id,                              // Always included
  scheduledAt: item.scheduledAt.toISOString(), // Included when sortBy=scheduledAt
  createdAt: item.createdAt.toISOString()   // Always included for stability
}
```

**Example cursor payload**: 
```json
{
  "id": "appt_123",
  "scheduledAt": "2024-01-15T10:00:00.000Z",
  "createdAt": "2024-01-10T08:00:00.000Z"
}
```

## 3. Prisma query args

**Location**: `apps/api/src/scheduling/scheduling.service.ts:225-240`

```typescript
const data = await this.prisma.appointment.findMany({
  where: {
    AND: [
      { lead: { organizationId } },
      // ... role-based filters
      cursorWhere,  // From buildCursorWhere(cursor, sortBy, sortOrder)
    ],
  },
  take: limit + 1,        // Fetch one extra to check hasNextPage
  skip: undefined,        // NOT USED (cursor-based pagination)
  orderBy: { 
    scheduledAt: 'asc',   // Primary sort
    id: 'asc'             // Tie-breaker
  },
  include: {
    lead: true,
    assignedCloser: { select: { id, firstName, lastName, email } },
  },
});
```

## 4. Cursor fields vs ordering fields - FIXED ✅

### Problem Found
- **Ordering**: `{ scheduledAt: 'asc', id: 'asc' }` (composite ordering)
- **Old cursor where**: Only handled `createdAt` and `updatedAt` specially
- **For `scheduledAt`**: Fell back to simple `id`-based comparison
- **Result**: Mismatch! Cursor used `id` comparison but ordering used `scheduledAt + id`

### Fix Applied
**Location**: `apps/api/src/common/pagination/pagination.util.ts:67-106`

Updated `buildCursorWhere` to handle `scheduledAt` as a date field with composite ordering:

```typescript
// For composite ordering with date fields (createdAt, updatedAt, scheduledAt, etc.)
const dateFields = ['createdAt', 'updatedAt', 'scheduledAt'];
if (dateFields.includes(sortBy)) {
  const cursorValue = cursorData[sortBy];
  if (cursorValue) {
    if (sortOrder === 'desc') {
      return {
        OR: [
          { [sortBy]: { lt: new Date(cursorValue) } },
          { [sortBy]: new Date(cursorValue), id: { lt: cursorData.id } },
        ],
      };
    } else {
      return {
        OR: [
          { [sortBy]: { gt: new Date(cursorValue) } },
          { [sortBy]: new Date(cursorValue), id: { gt: cursorData.id } },
        ],
      };
    }
  }
}
```

### Verification
✅ **Cursor fields now match ordering fields**:
- Ordering: `{ scheduledAt: 'asc', id: 'asc' }`
- Cursor where: Uses `scheduledAt` + `id` for composite comparison
- Both use the same fields in the same order

## Summary

**Before fix**: Cursor pagination for `scheduledAt` used only `id` comparison, causing incorrect pagination results.

**After fix**: Cursor pagination for `scheduledAt` uses composite `scheduledAt + id` comparison, matching the ordering exactly.
