/**
 * Parses standard list query params into Mongoose-friendly options.
 * Usage: const { page, limit, skip, sort } = parsePagination(req.query);
 */
function parsePagination(query, defaultSort = '-createdAt') {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  const sort = query.sort || defaultSort;
  return { page, limit, skip, sort };
}

function buildMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}

module.exports = { parsePagination, buildMeta };
