import { ilike, gte, lte, or, SQL, sql, eq } from 'drizzle-orm';
import { advocates } from '../../../db/schema';
import type { ListAdvocateFilters } from './types';

// Helper functions for building up query conditions for
// filtering

function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

export function buildStringConditions(filters: ListAdvocateFilters): SQL[] {
  const conditions: SQL[] = [];
  const stringFieldMap = [
    [filters.firstName, advocates.firstName],
    [filters.lastName, advocates.lastName],
    [filters.city, advocates.city],
    [filters.degree, advocates.degree],
  ] as const;

  for (const [value, column] of stringFieldMap) {
    const v = value?.trim();
    if (v) conditions.push(ilike(column, `%${v}%`));
  }
  return conditions;
}

export function buildYearsOfExperienceConditions(filters: ListAdvocateFilters): SQL[] {
  const conditions: SQL[] = [];
  const { yearsOfExperience, minYearsOfExperience, maxYearsOfExperience } = filters;

  if (isFiniteNumber(yearsOfExperience)) {
    conditions.push(eq(advocates.yearsOfExperience, yearsOfExperience));
    return conditions;
  }

  if (isFiniteNumber(minYearsOfExperience)) {
    conditions.push(gte(advocates.yearsOfExperience, minYearsOfExperience));
  }
  if (isFiniteNumber(maxYearsOfExperience)) {
    conditions.push(lte(advocates.yearsOfExperience, maxYearsOfExperience));
  }
  return conditions;
}

export function buildSpecialtiesCondition(values: string[] | undefined): SQL | undefined {
  if (!values?.length) return undefined;

  // Filter out empty strings
  const trimmed = values.map((v) => v.trim()).filter((s) => s.length > 0);
  if (trimmed.length === 0) return undefined;

  const containsClauses = trimmed.map((val) => {
    const jsonParam = JSON.stringify([val]);
    return sql`${advocates.specialties} @> ${jsonParam}::jsonb` as SQL;
  });

//   console.log("Contains Clauses", containsClauses);
//   console.log("...containsClauses", containsClauses.map((c) => c.getSQL().toString()));

  return containsClauses.length === 1 ? containsClauses[0] : or(...containsClauses);
}

export function buildAllConditions(filters?: ListAdvocateFilters): SQL[] {
  if (!filters) return [];

  const conditions: SQL[] = [];
  conditions.push(...buildStringConditions(filters));
  conditions.push(...buildYearsOfExperienceConditions(filters));

  const specialtiesCondition = buildSpecialtiesCondition(filters.specialties);

  if (specialtiesCondition) conditions.push(specialtiesCondition);
  return conditions;
}


