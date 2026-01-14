/**
 * Utilities for cursor-based pagination
 */

export interface CursorData {
  id: string;
  [key: string]: any; // For composite cursors (e.g., { createdAt, id })
}

/**
 * Encode cursor data to base64 string
 */
export function encodeCursor(data: CursorData): string {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

/**
 * Decode cursor string to data object
 * Backward compatible: ignores createdAt if present (legacy cursors)
 */
export function decodeCursor(cursor: string): CursorData | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const cursorData = JSON.parse(decoded);
    
    // Backward compatibility: remove createdAt if present (legacy behavior)
    // New cursors don't include createdAt unless it's the sortBy field
    if (cursorData.createdAt && cursorData.id) {
      // Only remove if createdAt is not the sortBy field
      // (We can't determine sortBy here, so we keep it for now)
      // The buildCursorWhere function will handle it correctly
    }
    
    return cursorData;
  } catch (error) {
    return null;
  }
}

/**
 * Build Prisma orderBy clause from sortBy and sortOrder
 * Returns an array for composite ordering (Prisma 6+ requirement)
 */
export function buildOrderBy(
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc',
  defaultOrderBy: any = { createdAt: 'desc', id: 'desc' },
): any {
  // If sortBy is a valid field and different from createdAt, use composite ordering
  if (sortBy && sortBy !== 'createdAt' && sortBy !== 'id') {
    // Return array for composite ordering (Prisma 6+ requirement)
    return [
      { [sortBy]: sortOrder },
      { id: sortOrder }, // Always include id for stable ordering
    ];
  }

  // For default ordering (createdAt desc, id desc) or when sortBy is createdAt/id
  // Return array for composite ordering
  if (defaultOrderBy && typeof defaultOrderBy === 'object' && !Array.isArray(defaultOrderBy)) {
    // Convert object to array format
    const keys = Object.keys(defaultOrderBy);
    return keys.map(key => ({ [key]: defaultOrderBy[key] }));
  }

  // If already an array, return as is
  if (Array.isArray(defaultOrderBy)) {
    return defaultOrderBy;
  }

  // Fallback: single field ordering
  return { [sortBy || 'createdAt']: sortOrder };
}

/**
 * Build Prisma where clause for cursor pagination
 * Assumes cursor contains { id, ...otherFields }
 */
export function buildCursorWhere(
  cursor: string | undefined,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc',
): any {
  if (!cursor) {
    return undefined;
  }

  const cursorData = decodeCursor(cursor);
  if (!cursorData || !cursorData.id) {
    return undefined;
  }

  // For composite ordering with date fields (createdAt, updatedAt, scheduledAt, etc.)
  // These fields require composite ordering with id as tie-breaker
  const dateFields = ['createdAt', 'updatedAt', 'scheduledAt'];
  if (dateFields.includes(sortBy)) {
    const cursorValue = cursorData[sortBy];
    if (cursorValue) {
      if (sortOrder === 'desc') {
        return {
          OR: [
            {
              [sortBy]: {
                lt: new Date(cursorValue),
              },
            },
            {
              [sortBy]: new Date(cursorValue),
              id: {
                lt: cursorData.id,
              },
            },
          ],
        };
      } else {
        return {
          OR: [
            {
              [sortBy]: {
                gt: new Date(cursorValue),
              },
            },
            {
              [sortBy]: new Date(cursorValue),
              id: {
                gt: cursorData.id,
              },
            },
          ],
        };
      }
    }
  }

  // For simple id-based ordering
  if (sortOrder === 'desc') {
    return {
      id: {
        lt: cursorData.id,
      },
    };
  } else {
    return {
      id: {
        gt: cursorData.id,
      },
    };
  }
}

/**
 * Extract cursor from last item in results
 * Only includes:
 * - id (always)
 * - sortBy field value when sortBy is a date field (createdAt/updatedAt/scheduledAt) 
 *   OR any non-id sort field used in composite ordering
 */
export function extractCursor(
  item: any,
  sortBy: string = 'createdAt',
): string | null {
  if (!item || !item.id) {
    return null;
  }

  const cursorData: CursorData = {
    id: item.id,
  };

  // Include sortBy field if it exists and is not 'id'
  // Date fields (createdAt, updatedAt, scheduledAt) and other non-id fields
  // used in composite ordering should be included
  if (sortBy && sortBy !== 'id' && item[sortBy]) {
    cursorData[sortBy] = item[sortBy] instanceof Date
      ? item[sortBy].toISOString()
      : item[sortBy];
  }

  return encodeCursor(cursorData);
}
