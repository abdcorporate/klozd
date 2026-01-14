# Pagination Strategy Analysis - All List Endpoints

## Summary: All endpoints use (B) Seek Pagination via cursorWhere

**Strategy**: (B) Seek pagination via `cursorWhere` without Prisma native `cursor`
- ✅ Consistent across all endpoints
- ✅ No `skip` parameter used
- ✅ No Prisma native `cursor` parameter used
- ✅ Uses `buildCursorWhere()` to add conditions to `where` clause
- ✅ Uses `take: limit + 1` to fetch one extra item for `hasNextPage` detection

---

## 1. GET /leads

**Service**: `apps/api/src/leads/leads.service.ts:301`

**Prisma findMany args**:
```typescript
{
  where: {
    AND: [
      { organizationId, ...filters },
      cursorWhere,  // From buildCursorWhere(cursor, sortBy, sortOrder)
    ],
  },
  take: limit + 1,  // Fetch one extra
  skip: undefined, // NOT USED
  cursor: undefined, // NOT USED (Prisma native cursor)
  orderBy: buildOrderBy(sortBy, sortOrder, { createdAt: 'desc', id: 'desc' }),
  include: { assignedCloser, assignedSetter, form, aiPrediction, _count },
}
```

**Strategy**: (B) Seek pagination via cursorWhere

---

## 2. GET /crm/deals

**Service**: `apps/api/src/crm/crm.service.ts:148`

**Prisma findMany args**:
```typescript
{
  where: {
    AND: [
      { organizationId, ...filters },
      cursorWhere,  // From buildCursorWhere(cursor, sortBy, sortOrder)
    ],
  },
  take: limit + 1,  // Fetch one extra
  skip: undefined, // NOT USED
  cursor: undefined, // NOT USED (Prisma native cursor)
  orderBy: buildOrderBy(sortBy, sortOrder, { createdAt: 'desc', id: 'desc' }),
  include: { lead: { include: { assignedCloser, assignedSetter } }, createdBy },
}
```

**Strategy**: (B) Seek pagination via cursorWhere

---

## 3. GET /scheduling/appointments

**Service**: `apps/api/src/scheduling/scheduling.service.ts:225`

**Prisma findMany args**:
```typescript
{
  where: {
    AND: [
      { lead: { organizationId }, ...filters },
      cursorWhere,  // From buildCursorWhere(cursor, sortBy, sortOrder)
    ],
  },
  take: limit + 1,  // Fetch one extra
  skip: undefined, // NOT USED
  cursor: undefined, // NOT USED (Prisma native cursor)
  orderBy: buildOrderBy(sortBy, sortOrder, { 
    scheduledAt: sortOrder, 
    id: sortOrder 
  }), // Default: { scheduledAt: 'asc', id: 'asc' }
  include: { lead, assignedCloser },
}
```

**Strategy**: (B) Seek pagination via cursorWhere

---

## 4. GET /notifications

**Service**: `apps/api/src/notifications/notifications.service.ts:238`

**Prisma findMany args**:
```typescript
{
  where: {
    AND: [
      { userId },
      cursorWhere,  // From buildCursorWhere(cursor, sortBy, sortOrder)
    ],
  },
  take: limit + 1,  // Fetch one extra
  skip: undefined, // NOT USED
  cursor: undefined, // NOT USED (Prisma native cursor)
  orderBy: buildOrderBy(sortBy, sortOrder, { createdAt: 'desc', id: 'desc' }),
  // No include/select (returns all fields)
}
```

**Strategy**: (B) Seek pagination via cursorWhere

---

## 5. GET /users

**Service**: `apps/api/src/users/users.service.ts:192`

**Prisma findMany args**:
```typescript
{
  where: {
    AND: [
      { organizationId? (or no org filter for SUPER_ADMIN), ...filters },
      cursorWhere,  // From buildCursorWhere(cursor, sortBy, sortOrder)
    ],
  },
  take: limit + 1,  // Fetch one extra
  skip: undefined, // NOT USED
  cursor: undefined, // NOT USED (Prisma native cursor)
  orderBy: buildOrderBy(sortBy, sortOrder, { createdAt: 'desc', id: 'desc' }),
  select: selectFields, // Role-based field selection
}
```

**Strategy**: (B) Seek pagination via cursorWhere

---

## 6. GET /forms

**Service**: `apps/api/src/forms/forms.service.ts:105` (and `findAllForAdmin` at line 170)

**Prisma findMany args**:
```typescript
{
  where: {
    AND: [
      { organizationId }, // or {} for findAllForAdmin
      cursorWhere,  // From buildCursorWhere(cursor, sortBy, sortOrder)
    ],
  },
  take: limit + 1,  // Fetch one extra
  skip: undefined, // NOT USED
  cursor: undefined, // NOT USED (Prisma native cursor)
  orderBy: buildOrderBy(sortBy, sortOrder, { createdAt: 'desc', id: 'desc' }),
  include: { formFields, _count, organization? (for admin) },
}
```

**Strategy**: (B) Seek pagination via cursorWhere

---

## 7. GET /sites

**Service**: `apps/api/src/sites/sites.service.ts:92` (and `findAll` at line 162)

**Prisma findMany args**:
```typescript
{
  where: {
    AND: [
      { organizationId }, // or {} for findAllForAdmin
      cursorWhere,  // From buildCursorWhere(cursor, sortBy, sortOrder)
    ],
  },
  take: limit + 1,  // Fetch one extra
  skip: undefined, // NOT USED
  cursor: undefined, // NOT USED (Prisma native cursor)
  orderBy: buildOrderBy(sortBy, sortOrder, { createdAt: 'desc', id: 'desc' }),
  include: { form: { include: { formFields } }, organization? (for admin) },
}
```

**Strategy**: (B) Seek pagination via cursorWhere

---

## Conclusion

✅ **All endpoints use the SAME strategy: (B) Seek pagination via cursorWhere**

**No refactoring needed** - the implementation is already consistent:
- All use `buildCursorWhere()` to add cursor conditions to `where`
- All use `take: limit + 1` (no `skip`)
- None use Prisma's native `cursor` parameter
- Cursor fields match ordering fields (after the scheduledAt fix)

**Duplicate prevention**: 
- ✅ Cursor includes the exact fields used in `orderBy` (sortBy + id)
- ✅ `buildCursorWhere` creates proper OR conditions for composite ordering
- ✅ No duplicates possible between pages because cursor is based on the last item's exact values
