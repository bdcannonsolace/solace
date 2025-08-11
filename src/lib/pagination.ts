import { PgSelect } from "drizzle-orm/pg-core";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function parsePositiveIntOrDefault(
  value: string | null | undefined,
  defaultValue: number,
): number {
  const parsed = value != null ? parseInt(value, 10) : Number.NaN;
  if (Number.isNaN(parsed) || parsed < 1) {
    return defaultValue;
  }
  return parsed;
}

export function getPaginationParams(request?: Request) {
  const url = request?.url ? new URL(request.url) : undefined;
  const page = parsePositiveIntOrDefault(url?.searchParams.get("page"), 1);
  let pageSize = parsePositiveIntOrDefault(
    url?.searchParams.get("pageSize"),
    DEFAULT_PAGE_SIZE,
  );

  // Make sure the user doesn't request some massive page size
  if (pageSize > MAX_PAGE_SIZE) {
    pageSize = MAX_PAGE_SIZE;
  }

  return { page, pageSize };
}

// https://orm.drizzle.team/docs/dynamic-query-building
export function withPagination<T extends PgSelect >(
  qb: T,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  return qb.limit(pageSize).offset((page - 1) * pageSize);
}

export { DEFAULT_PAGE_SIZE };


