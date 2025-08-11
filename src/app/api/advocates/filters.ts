import type { ListAdvocateFilters } from './types';
import { z } from 'zod';

export function trimToOptionalString(input: unknown): string | undefined {
  if (input == null) return undefined;
  
  const value = String(input).trim();
  return value.length > 0 ? value : undefined;
}

// Converts inputs like "one,two,three" to ["one", "two", "three"]
export function csvOrArrayToStringArray(input: unknown): string[] | undefined {
  if (input == null) return undefined;

  const parts = Array.isArray(input) ? input : [input];
  const values = parts
    .flatMap((v) => String(v).split(','))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return values.length > 0 ? values : undefined;
}

export function parseIntOrUndefined(input: unknown): number | undefined {
  if (input == null) return undefined;
  
  const n = Number(input);
  return Number.isFinite(n) ? n : undefined;
}

export const AdvocateFilterSchema = z
  .object({
    firstName: z.preprocess(trimToOptionalString, z.string().optional()),
    lastName: z.preprocess(trimToOptionalString, z.string().optional()),
    city: z.preprocess(trimToOptionalString, z.string().optional()),
    degree: z.preprocess(trimToOptionalString, z.string().optional()),
    specialties: z.preprocess(csvOrArrayToStringArray, z.array(z.string()).optional()),
    yearsOfExperience: z.preprocess(parseIntOrUndefined, z.number().int().optional()),
    minYearsOfExperience: z.preprocess(parseIntOrUndefined, z.number().int().optional()),
    maxYearsOfExperience: z.preprocess(parseIntOrUndefined, z.number().int().optional()),
  })
  .strip();

function convertParamsToObject(params: URLSearchParams): Record<string, string> {
  return Object.fromEntries(params) as Record<string, string>;
}

export function buildFiltersFromRequest(request: Request): ListAdvocateFilters {
  const url = new URL(request.url);
  const params = url.searchParams;
  const obj = convertParamsToObject(params);

  const parsed = AdvocateFilterSchema.parse(obj);

  return parsed;
}


