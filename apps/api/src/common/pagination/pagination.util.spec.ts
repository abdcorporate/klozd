import { encodeCursor, decodeCursor, extractCursor, buildCursorWhere } from './pagination.util';

describe('Pagination Utilities', () => {
  describe('encodeCursor / decodeCursor', () => {
    it('should encode and decode cursor data correctly', () => {
      const data = { id: 'test-id', scheduledAt: '2024-01-15T10:00:00.000Z' };
      const encoded = encodeCursor(data);
      const decoded = decodeCursor(encoded);

      expect(decoded).toEqual(data);
    });

    it('should handle backward compatible cursors with createdAt', () => {
      // Legacy cursor format with createdAt
      const legacyData = { 
        id: 'test-id', 
        scheduledAt: '2024-01-15T10:00:00.000Z',
        createdAt: '2024-01-10T08:00:00.000Z' // Legacy field
      };
      const encoded = encodeCursor(legacyData);
      const decoded = decodeCursor(encoded);

      // Should decode successfully (backward compatible)
      expect(decoded).toBeDefined();
      expect(decoded?.id).toBe('test-id');
      expect(decoded?.scheduledAt).toBe('2024-01-15T10:00:00.000Z');
      // createdAt is kept for backward compatibility (buildCursorWhere will handle it)
      expect(decoded?.createdAt).toBe('2024-01-10T08:00:00.000Z');
    });

    it('should return null for invalid cursor strings', () => {
      expect(decodeCursor('invalid-base64')).toBeNull();
      expect(decodeCursor('not-json')).toBeNull();
      expect(decodeCursor('')).toBeNull();
    });
  });

  describe('extractCursor', () => {
    it('should extract cursor with id and sortBy field (date field)', () => {
      const item = {
        id: 'appt-123',
        scheduledAt: new Date('2024-01-15T10:00:00.000Z'),
        createdAt: new Date('2024-01-10T08:00:00.000Z'),
      };

      const cursor = extractCursor(item, 'scheduledAt');
      expect(cursor).toBeTruthy();

      const decoded = decodeCursor(cursor!);
      expect(decoded).toEqual({
        id: 'appt-123',
        scheduledAt: '2024-01-15T10:00:00.000Z',
      });
      // createdAt should NOT be included
      expect(decoded?.createdAt).toBeUndefined();
    });

    it('should extract cursor with id and createdAt when sortBy is createdAt', () => {
      const item = {
        id: 'lead-456',
        createdAt: new Date('2024-01-10T08:00:00.000Z'),
        updatedAt: new Date('2024-01-12T09:00:00.000Z'),
      };

      const cursor = extractCursor(item, 'createdAt');
      const decoded = decodeCursor(cursor!);

      expect(decoded).toEqual({
        id: 'lead-456',
        createdAt: '2024-01-10T08:00:00.000Z',
      });
      // updatedAt should NOT be included
      expect(decoded?.updatedAt).toBeUndefined();
    });

    it('should extract cursor with id and updatedAt when sortBy is updatedAt', () => {
      const item = {
        id: 'deal-789',
        createdAt: new Date('2024-01-10T08:00:00.000Z'),
        updatedAt: new Date('2024-01-12T09:00:00.000Z'),
      };

      const cursor = extractCursor(item, 'updatedAt');
      const decoded = decodeCursor(cursor!);

      expect(decoded).toEqual({
        id: 'deal-789',
        updatedAt: '2024-01-12T09:00:00.000Z',
      });
      // createdAt should NOT be included
      expect(decoded?.createdAt).toBeUndefined();
    });

    it('should extract cursor with only id when sortBy is id', () => {
      const item = {
        id: 'user-123',
        createdAt: new Date('2024-01-10T08:00:00.000Z'),
      };

      const cursor = extractCursor(item, 'id');
      const decoded = decodeCursor(cursor!);

      expect(decoded).toEqual({
        id: 'user-123',
      });
      // No other fields should be included
      expect(decoded?.createdAt).toBeUndefined();
    });

    it('should extract cursor with id and non-date sortBy field', () => {
      const item = {
        id: 'form-123',
        name: 'Test Form',
        createdAt: new Date('2024-01-10T08:00:00.000Z'),
      };

      const cursor = extractCursor(item, 'name');
      const decoded = decodeCursor(cursor!);

      expect(decoded).toEqual({
        id: 'form-123',
        name: 'Test Form',
      });
      // createdAt should NOT be included
      expect(decoded?.createdAt).toBeUndefined();
    });

    it('should return null for items without id', () => {
      const item = { name: 'test' };
      expect(extractCursor(item, 'name')).toBeNull();
    });

    it('should return null for null/undefined items', () => {
      expect(extractCursor(null, 'createdAt')).toBeNull();
      expect(extractCursor(undefined, 'createdAt')).toBeNull();
    });

    it('should handle missing sortBy field gracefully', () => {
      const item = {
        id: 'item-123',
        createdAt: new Date('2024-01-10T08:00:00.000Z'),
      };

      const cursor = extractCursor(item, 'nonExistentField');
      const decoded = decodeCursor(cursor!);

      // Should only include id
      expect(decoded).toEqual({
        id: 'item-123',
      });
    });
  });

  describe('buildCursorWhere', () => {
    it('should build correct where clause for scheduledAt with asc order', () => {
      const cursor = encodeCursor({
        id: 'appt-123',
        scheduledAt: '2024-01-15T10:00:00.000Z',
      });

      const where = buildCursorWhere(cursor, 'scheduledAt', 'asc');

      expect(where).toEqual({
        OR: [
          { scheduledAt: { gt: new Date('2024-01-15T10:00:00.000Z') } },
          { scheduledAt: new Date('2024-01-15T10:00:00.000Z'), id: { gt: 'appt-123' } },
        ],
      });
    });

    it('should build correct where clause for scheduledAt with desc order', () => {
      const cursor = encodeCursor({
        id: 'appt-123',
        scheduledAt: '2024-01-15T10:00:00.000Z',
      });

      const where = buildCursorWhere(cursor, 'scheduledAt', 'desc');

      expect(where).toEqual({
        OR: [
          { scheduledAt: { lt: new Date('2024-01-15T10:00:00.000Z') } },
          { scheduledAt: new Date('2024-01-15T10:00:00.000Z'), id: { lt: 'appt-123' } },
        ],
      });
    });

    it('should handle backward compatible cursors with createdAt', () => {
      // Legacy cursor with createdAt (should be ignored if scheduledAt is present)
      const legacyCursor = encodeCursor({
        id: 'appt-123',
        scheduledAt: '2024-01-15T10:00:00.000Z',
        createdAt: '2024-01-10T08:00:00.000Z', // Legacy field
      });

      const where = buildCursorWhere(legacyCursor, 'scheduledAt', 'asc');

      // Should use scheduledAt, not createdAt
      expect(where).toEqual({
        OR: [
          { scheduledAt: { gt: new Date('2024-01-15T10:00:00.000Z') } },
          { scheduledAt: new Date('2024-01-15T10:00:00.000Z'), id: { gt: 'appt-123' } },
        ],
      });
    });

    it('should return undefined for invalid cursor', () => {
      expect(buildCursorWhere(undefined, 'scheduledAt', 'asc')).toBeUndefined();
      expect(buildCursorWhere('invalid', 'scheduledAt', 'asc')).toBeUndefined();
    });
  });
});
