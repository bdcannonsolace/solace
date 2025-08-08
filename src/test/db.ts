import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export function getTestDb(): PostgresJsDatabase {
  const g = global as any;
  if (!g.__TEST_DB__?.db) throw new Error('Test DB not initialized');
  return g.__TEST_DB__.db as PostgresJsDatabase;
}


