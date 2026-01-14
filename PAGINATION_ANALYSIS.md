# Pagination Analysis: GET /scheduling/appointments

## Current Implementation

### 1. Default orderBy fields (including tie-breaker)

**Location**: `apps/api/src/scheduling/scheduling.service.ts:218-221`

```typescript
const defaultOrderBy = sortBy === 'scheduledAt'
  ? { scheduledAt: sortOrder, id: sortOrder }
  : { createdAt: 'desc', id: 'desc' };
const orderBy = buildOrderBy(sortBy, sortOrder, defaultOrderBy);
```

**When `sortBy=scheduledAt`**:
- Primary: `scheduledAt: sortOrder` (default: 'asc')
- Tie-breaker: `id: sortOrder` (default: 'asc')

**Result**: `{ scheduledAt: 'asc', id: 'asc' }`

### 2. Cursor payload fields used when sortBy=scheduledAt

**Location**: `apps/api/src/common/pagination/pagination.util.ts:126-153`

The `extractCursor` function creates cursor with:
- `id`: Always included
- `scheduledAt`: Included because `sortBy === 'scheduledAt'` and item has `scheduledAt` field
- `createdAt`: Always included (for stable ordering)

**Result cursor payload**: `{ id: "...", scheduledAt: "2024-01-15T10:00:00.000Z", createdAt: "2024-01-10T08:00:00.000Z" }`

### 3. Prisma query args

**Location**: `apps/api/src/scheduling/scheduling.service.ts:225-240`

```typescript
const data = await this.prisma.appointment.findMany({
  where: {
    // Role-based filters + cursorWhere
    AND: [
      { lead: { organizationId } },
      // ... other filters
      cursorWhere, // From buildCursorWhere
    ],
  },
  take: limit + 1,  // Fetch one extra to check hasNextPage
  skip: undefined,   // NOT USED (cursor-based pagination)
  orderBy: { scheduledAt: 'asc', id: 'asc' },
  include: { lead: true, assignedCloser: {...} },
});
```

### 4. Cursor fields vs ordering fields - MISMATCH FOUND! ❌

**Problem**: 
- **Ordering**: `{ scheduledAt: 'asc', id: 'asc' }` (composite ordering by date + id)
- **Cursor where clause**: `buildCursorWhere` only handles `createdAt` and `updatedAt` specially
- **For `scheduledAt`**: Falls back to simple `id`-based comparison
- **Result**: Cursor pagination uses `id` comparison but ordering uses `scheduledAt + id`, causing incorrect pagination!

**Current `buildCursorWhere` logic** (line 68):
```typescript
if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
  // Composite ordering with date + id
} else {
  // Simple id-based ordering ❌ WRONG for scheduledAt!
}
```

## Fix Required

Update `buildCursorWhere` to handle `scheduledAt` the same way as `createdAt`/`updatedAt` (as a date field with composite ordering).
