'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface PageInfo {
  limit: number;
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageInfo: PageInfo;
}

export interface UseCursorPaginationOptions {
  defaultLimit?: number;
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

export interface UseCursorPaginationReturn<T> {
  items: T[];
  pageInfo: PageInfo | null;
  loading: boolean;
  error: Error | null;
  // Query params from URL
  limit: number;
  cursor: string | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  q: string;
  // Helpers
  setQuery: (query: string) => void;
  setSort: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  nextPage: () => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setItems: (items: T[]) => void;
  setPageInfo: (pageInfo: PageInfo | null) => void;
}

export function useCursorPagination<T = any>(
  options: UseCursorPaginationOptions = {},
): UseCursorPaginationReturn<T> {
  const {
    defaultLimit = 25,
    defaultSortBy = 'createdAt',
    defaultSortOrder = 'desc',
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();

  // Read from URL query params
  const limit = Number(searchParams.get('limit')) || defaultLimit;
  const cursor = searchParams.get('cursor') || null;
  const sortBy = searchParams.get('sortBy') || defaultSortBy;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || defaultSortOrder;
  const q = searchParams.get('q') || '';

  // State
  const [items, setItems] = useState<T[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Update URL query params
  const updateUrl = useCallback(
    (updates: {
      limit?: number;
      cursor?: string | null;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      q?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.limit !== undefined) {
        if (updates.limit === defaultLimit) {
          params.delete('limit');
        } else {
          params.set('limit', updates.limit.toString());
        }
      }

      if (updates.cursor !== undefined) {
        if (updates.cursor === null) {
          params.delete('cursor');
        } else {
          params.set('cursor', updates.cursor);
        }
      }

      if (updates.sortBy !== undefined) {
        if (updates.sortBy === defaultSortBy) {
          params.delete('sortBy');
        } else {
          params.set('sortBy', updates.sortBy);
        }
      }

      if (updates.sortOrder !== undefined) {
        if (updates.sortOrder === defaultSortOrder) {
          params.delete('sortOrder');
        } else {
          params.set('sortOrder', updates.sortOrder);
        }
      }

      if (updates.q !== undefined) {
        if (updates.q === '') {
          params.delete('q');
        } else {
          params.set('q', updates.q);
        }
      }

      // Reset cursor when changing filters/sort
      if (updates.q !== undefined || updates.sortBy !== undefined || updates.sortOrder !== undefined) {
        params.delete('cursor');
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, defaultLimit, defaultSortBy, defaultSortOrder],
  );

  // Helpers
  const setQuery = useCallback(
    (query: string) => {
      updateUrl({ q: query });
    },
    [updateUrl],
  );

  const setSort = useCallback(
    (newSortBy: string, newSortOrder?: 'asc' | 'desc') => {
      updateUrl({
        sortBy: newSortBy,
        sortOrder: newSortOrder || (sortOrder === 'asc' ? 'desc' : 'asc'),
      });
    },
    [updateUrl, sortOrder],
  );

  const nextPage = useCallback(() => {
    if (pageInfo?.nextCursor) {
      updateUrl({ cursor: pageInfo.nextCursor });
    }
  }, [pageInfo, updateUrl]);

  const reset = useCallback(() => {
    const params = new URLSearchParams();
    if (defaultLimit !== 25) {
      params.set('limit', defaultLimit.toString());
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, defaultLimit]);

  return {
    items,
    pageInfo,
    loading,
    error,
    limit,
    cursor,
    sortBy,
    sortOrder,
    q,
    setQuery,
    setSort,
    nextPage,
    reset,
    setLoading,
    setError,
    setItems,
    setPageInfo,
  };
}
