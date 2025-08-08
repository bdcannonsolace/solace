import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql as dsql } from 'drizzle-orm';
import fs from 'node:fs';
import path from 'node:path';

let sql: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var __TEST_DB__: {
    sql: ReturnType<typeof postgres> | null;
    db: ReturnType<typeof drizzle> | null;
  } | undefined;
}

beforeAll(async () => {
  const url = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL_TEST or DATABASE_URL must be set for tests');

  sql = postgres(url, { max: 1 });
  db = drizzle(sql);
  
  const migrationsDir = path.resolve(process.cwd(), 'drizzle');
  if (fs.existsSync(migrationsDir)) {
    await migrate(db, { migrationsFolder: migrationsDir });
  }
  global.__TEST_DB__ = { sql, db };
});

afterAll(async () => {
  if (sql) await sql.end();
  global.__TEST_DB__ = undefined;
});

beforeEach(async () => {
  if (!db) return;
  // Truncate all test tables you need to reset. For now, just advocates
  await db.execute(dsql`TRUNCATE TABLE advocates RESTART IDENTITY CASCADE`);
});

export {}; // ensure this is treated as a module


