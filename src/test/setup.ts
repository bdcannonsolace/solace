import path from 'node:path';
import { createHash } from 'crypto';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql as dsql } from 'drizzle-orm';
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import db from '../db';

beforeAll(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL must be set for tests in test.env');

  const migrationsDir = path.resolve(process.cwd(), 'drizzle');

  try {
    // Run the migrations
    await migrate(db, { migrationsFolder: migrationsDir });
  } catch (err: any) {
    if (err?.code === 'ENOENT' || /migrations folder/i.test(String(err?.message))) {
      // If no migrations folder exists, continue without failing tests
      // eslint-disable-next-line no-console
      console.warn(`[tests] Migrations folder not found at ${migrationsDir}, skipping migrations.`);
    } else {
      throw err;
    }
  }

  // Start an outer transaction that will wrap all tests
  await db.execute(dsql`BEGIN`);
  // Ensure a clean base state once; per-test isolation is via savepoints
  await db.execute(dsql`TRUNCATE TABLE advocates RESTART IDENTITY CASCADE`);
});

afterAll(async () => {
  // Roll back everything done during the test suite
  await db.execute(dsql`ROLLBACK`);
});

beforeEach(async (ctx) => {
  const savepoint = generateSavepointName(ctx);

  await db.execute(dsql.raw(`SAVEPOINT ${savepoint}`));
});

afterEach(async (ctx) => {
  const savepoint = generateSavepointName(ctx);
  await db.execute(dsql.raw(`ROLLBACK TO SAVEPOINT ${savepoint}`));
  await db.execute(dsql.raw(`RELEASE SAVEPOINT ${savepoint}`));
});

export {}; // ensure this is treated as a module

function generateSavepointName(ctx: any): string {
  const task = ctx?.task;
  const base = `${task?.file?.name ?? 'nofile'}:${task?.name ?? 'notask'}`;
  const hash = sha256Hash(base).toString().slice(0, 10);

  return `sp_${hash}`;
}

function sha256Hash(str: string): string {
  return createHash('sha256').update(str).digest('hex');
}


