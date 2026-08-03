const { parsePagination, buildMeta } = require('../../src/utils/pagination');

describe('parsePagination', () => {
  it('applies sensible defaults when no query params are given', () => {
    const result = parsePagination({});
    expect(result).toEqual({ page: 1, limit: 20, skip: 0, sort: '-createdAt' });
  });

  it('computes skip correctly for later pages', () => {
    const result = parsePagination({ page: '3', limit: '10' });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(10);
    expect(result.skip).toBe(20);
  });

  it('clamps an oversized limit to 100', () => {
    expect(parsePagination({ limit: '500' }).limit).toBe(100);
  });

  it('falls back to the default limit when given 0 (falsy, not a valid page size)', () => {
    expect(parsePagination({ limit: '0' }).limit).toBe(20);
  });

  it('never returns a page below 1', () => {
    expect(parsePagination({ page: '-5' }).page).toBe(1);
  });
});

describe('buildMeta', () => {
  it('computes totalPages and hasNextPage/hasPrevPage correctly', () => {
    const meta = buildMeta({ page: 2, limit: 10, total: 25 });
    expect(meta.totalPages).toBe(3);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPrevPage).toBe(true);
  });

  it('reports hasNextPage=false on the last page', () => {
    const meta = buildMeta({ page: 3, limit: 10, total: 25 });
    expect(meta.hasNextPage).toBe(false);
  });

  it('reports hasPrevPage=false on the first page', () => {
    const meta = buildMeta({ page: 1, limit: 10, total: 25 });
    expect(meta.hasPrevPage).toBe(false);
  });
});
