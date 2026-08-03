import { useState, useCallback } from 'react';

export function usePagination(initialPage = 1, initialLimit = 20) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = useCallback((meta) => {
    setPage((p) => (meta?.hasNextPage ? p + 1 : p));
  }, []);
  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);
  const reset = useCallback(() => setPage(1), []);

  return { page, limit, setPage, setLimit, nextPage, prevPage, reset };
}
