require('dotenv').config({path: path.resolve(process.cwd(), '/.env.test')});
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql as dsql } from 'drizzle-orm';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import path from 'node:path';
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
});

afterAll(async () => {
});

beforeEach(async () => {
  if (!db) return;
  // Truncate all test tables you need to reset. For now, just advocates
  await db.execute(dsql`TRUNCATE TABLE advocates RESTART IDENTITY CASCADE`);
});

export {}; // ensure this is treated as a module


