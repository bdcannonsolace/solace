import { describe, it, expect } from 'vitest';
import { advocates } from '../../../db/schema';

// We import GET after the setup has run so the app db can point to the test db
import { GET } from './route';

// Access the db initialized in setup
const getDb = () => {
  const g = global as any;
  if (!g.__TEST_DB__?.db) throw new Error('Test DB not initialized');
  return g.__TEST_DB__.db as import('drizzle-orm/postgres-js').PostgresJsDatabase;
};

describe('GET /api/advocates (integration)', () => {
  it('returns empty list when no rows', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: [] });
  });

  it('returns inserted advocates from real DB', async () => {
    const db = getDb();
    await db.insert(advocates).values({
      firstName: 'Ada',
      lastName: 'Lovelace',
      city: 'London',
      degree: 'Mathematics',
      specialties: ['algorithms'],
      yearsOfExperience: 10,
      phoneNumber: 1111111111,
    });

    await db.insert(advocates).values({
      firstName: 'Grace',
      lastName: 'Hopper',
      city: 'New York',
      degree: 'Mathematics',
      specialties: ['compilers'],
      yearsOfExperience: 15,
      phoneNumber: 2222222222,
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.data[0]).toMatchObject({ firstName: 'Ada', lastName: 'Lovelace' });
    expect(body.data[1]).toMatchObject({ firstName: 'Grace', lastName: 'Hopper' });
  });
});


