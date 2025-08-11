import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { asc } from 'drizzle-orm';
import appDb from '../../../db';
import { advocates } from '../../../db/schema';
import { withPagination, DEFAULT_PAGE_SIZE } from '../../../lib/pagination';

// This is the Advocate Service. It contains the business logic for the Advocate API.
export async function listAdvocates(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
  dbLike: PostgresJsDatabase = appDb,
) {
  const query = withPagination(
    dbLike.select().from(advocates).orderBy(asc(advocates.id)).$dynamic(),
    page,
    pageSize,
  );

  const rows = await query;
  
  return rows;
}


