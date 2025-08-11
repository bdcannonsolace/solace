import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, asc, ilike, gte, lte, or, SQL, sql } from 'drizzle-orm';
import appDb from '../../../db';
import { advocates } from '../../../db/schema';
import { withPagination, DEFAULT_PAGE_SIZE } from '../../../lib/pagination';

// This is the Advocate Service. It contains the business logic for the Advocate API.
export type ListAdvocateFilters = {
  firstName?: string;
  lastName?: string;
  city?: string;
  degree?: string;
  specialties?: string[]; // matches any of the provided specialties
  yearsOfExperience?: number; // exact match
  minYearsOfExperience?: number; // inclusive lower bound
  maxYearsOfExperience?: number; // inclusive upper bound
};

export async function listAdvocates(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
  dbLike: PostgresJsDatabase,
  filters?: ListAdvocateFilters,
) {

  let baseQuery = dbLike
    .select()
    .from(advocates)
    .orderBy(asc(advocates.id))
    .$dynamic();

  const conditions: (SQL | undefined)[] = [];

  if (filters) {
    const {
      firstName,
      lastName,
      city,
      degree,
      specialties,
      yearsOfExperience,
      minYearsOfExperience,
      maxYearsOfExperience,
    } = filters;

    if (firstName && firstName.trim() !== '') {
      conditions.push(ilike(advocates.firstName, `%${firstName.trim()}%`));
    }

    if (lastName && lastName.trim() !== '') {
      conditions.push(ilike(advocates.lastName, `%${lastName.trim()}%`));
    }

    if (city && city.trim() !== '') {
      conditions.push(ilike(advocates.city, `%${city.trim()}%`));
    }

    if (degree && degree.trim() !== '') {
      conditions.push(ilike(advocates.degree, `%${degree.trim()}%`));
    }

    if (typeof yearsOfExperience === 'number' && Number.isFinite(yearsOfExperience)) {
      conditions.push(sql`${advocates.yearsOfExperience} = ${yearsOfExperience}`);
    }

    if (typeof minYearsOfExperience === 'number' && Number.isFinite(minYearsOfExperience)) {
      conditions.push(gte(advocates.yearsOfExperience, minYearsOfExperience));
    }

    if (typeof maxYearsOfExperience === 'number' && Number.isFinite(maxYearsOfExperience)) {
      conditions.push(lte(advocates.yearsOfExperience, maxYearsOfExperience));
    }

    if (Array.isArray(specialties) && specialties.length > 0) {
      const trimmed = specialties
        .map((s) => (s ?? '').toString().trim())
        .filter((s) => s.length > 0);

      if (trimmed.length === 1) {
        // payload @> '["value"]'::jsonb
        const jsonParam = JSON.stringify([trimmed[0]]);
        conditions.push(sql`${advocates.specialties} @> ${jsonParam}::jsonb`);
      } else if (trimmed.length > 1) {
        // (payload @> '["a"]' OR payload @> '["b"]' ...)
        const anyOf = trimmed.map((val) => {
          const jsonParam = JSON.stringify([val]);
          return sql`${advocates.specialties} @> ${jsonParam}::jsonb` as SQL;
        });
        conditions.push(or(...anyOf));
      }
    }
  }

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...(conditions.filter(Boolean) as SQL[])));
  }

  const query = withPagination(baseQuery, page, pageSize);

  const rows = await query;
  
  return rows;
}


