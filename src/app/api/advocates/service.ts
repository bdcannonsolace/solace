import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, asc, SQL } from 'drizzle-orm';
import { advocates } from '../../../db/schema';
import { withPagination, DEFAULT_PAGE_SIZE } from '../../../lib/pagination';
import type { ListAdvocateFilters } from './types';
import { buildAllConditions } from './conditions';

// This is the Advocate Service. It contains the business logic for the Advocate API.
export async function listAdvocates(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
  dbLike: PostgresJsDatabase,
  filters?: ListAdvocateFilters,
) {

  let baseQuery = dbLike
    .select()
    .from(advocates)
    .orderBy(asc(advocates.firstName), asc(advocates.lastName))
    .$dynamic();

  const conditions = buildAllConditions(filters);

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...(conditions.filter(Boolean) as SQL[])));
  }

  const query = withPagination(baseQuery, page, pageSize);

  const rows = await query;
  
  return rows;
}


