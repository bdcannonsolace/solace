import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { count } from 'drizzle-orm';
import { advocates } from '../../../db/schema';
import db from '../../../db';

type Advocate = typeof advocates.$inferSelect;

// We import GET after the setup has run so the app db can point to the test db
import { GET } from './route';

function makeAdvocate(n: number) {
  return {
    firstName: `First${n}`,
    lastName: `Last${n}`,
    city: 'City',
    degree: 'Degree',
    specialties: ['one'],
    yearsOfExperience: 1 + (n % 30),
    phoneNumber: 1000000000 + n,
  }
}

const insertAdvocates = async (count: number): Promise<Advocate[]> => {
  const rows = Array.from({ length: count }, (_, i) => makeAdvocate(i + 1));
  const insertedAdvocates = await db.insert(advocates).values(rows).returning();

  return insertedAdvocates
};

describe('GET /api/advocates', () => {
  describe('return advocates', () => {
    it('returns empty list when no rows', async () => {
      const res = await GET();
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({ data: [] });
    });

    it('returns inserted advocates from real DB', async () => {
      const advocates = await insertAdvocates(2);

      const res = await GET();
      expect(res.status).toBe(200);
      
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);

      expect(body.data).toHaveLength(2);
      expect(body.data[0]).toMatchObject({ firstName: advocates[0].firstName, lastName: advocates[0].lastName });
      expect(body.data[1]).toMatchObject({ firstName: advocates[1].firstName, lastName: advocates[1].lastName });
    });
  });

  describe('when using pagination', () => {
    beforeAll(async () => {
      // At the moment, a page size of 10 is hardcoded in the route.
      // so 25 is enough to test pagination.
      await insertAdvocates(25);
    });

    it('uses defaults when no query params: returns first 10 ordered by id asc', async () => {
      await insertAdvocates(25);
  
      const res = await GET();
      expect(res.status).toBe(200);
      
      const body = await res.json();
      expect(body.data).toHaveLength(10);
      expect(body.data[0]).toMatchObject({ firstName: 'First1', lastName: 'Last1' });
      expect(body.data[9]).toMatchObject({ firstName: 'First10', lastName: 'Last10' });
    });
  
    it('supports page parameter with default pageSize=10', async () => {
      await insertAdvocates(25);
  
      const res = await GET(new Request('http://localhost/api/advocates?page=2'));
      const body = await res.json();
      expect(body.data).toHaveLength(10);
      expect(body.data[0]).toMatchObject({ firstName: 'First11', lastName: 'Last11' });
      expect(body.data[9]).toMatchObject({ firstName: 'First20', lastName: 'Last20' });
    });
  
    it('supports pageSize parameter', async () => {
      await insertAdvocates(25);
  
      const res = await GET(new Request('http://localhost/api/advocates?pageSize=5'));
      const body = await res.json();
      expect(body.data).toHaveLength(5);
      expect(body.data[0]).toMatchObject({ firstName: 'First1' });
      expect(body.data[4]).toMatchObject({ firstName: 'First5' });
    });
  
    it('supports combined page and pageSize', async () => {
      await insertAdvocates(25);
  
      const res = await GET(new Request('http://localhost/api/advocates?page=3&pageSize=5'));
      const body = await res.json();
      expect(body.data).toHaveLength(5);
      expect(body.data[0]).toMatchObject({ firstName: 'First11' });
      expect(body.data[4]).toMatchObject({ firstName: 'First15' });
    });
  
    it('falls back to defaults when page is invalid (0, negative, non-numeric)', async () => {
      await insertAdvocates(25);
  
      const urls = [
        'http://localhost/api/advocates?page=0&pageSize=5',
        'http://localhost/api/advocates?page=-3&pageSize=5',
        'http://localhost/api/advocates?page=abc&pageSize=5',
      ];
  
      for (const url of urls) {
        const res = await GET(new Request(url));
        const body = await res.json();
        expect(body.data).toHaveLength(5);
        expect(body.data[0]).toMatchObject({ firstName: 'First1' });
      }
    });
  
    it('falls back to default pageSize when pageSize is invalid (0, negative, non-numeric)', async () => {
      await insertAdvocates(25);
  
      const urls = [
        'http://localhost/api/advocates?pageSize=0',
        'http://localhost/api/advocates?pageSize=-10',
        'http://localhost/api/advocates?pageSize=abc',
      ];
  
      for (const url of urls) {
        const res = await GET(new Request(url));
        const body = await res.json();
        expect(body.data).toHaveLength(10);
        expect(body.data[0]).toMatchObject({ firstName: 'First1' });
      }
    });
  
    it('returns empty array when page is beyond available data', async () => {
      await insertAdvocates(25);
  
      const res = await GET(new Request('http://localhost/api/advocates?page=6&pageSize=5'));
      const body = await res.json();
      expect(body.data).toHaveLength(0);
    });
  
    it('accepts fractional numbers by using integer part (parseInt behavior)', async () => {
      await insertAdvocates(25);
  
      const res = await GET(new Request('http://localhost/api/advocates?page=2.9&pageSize=5.7'));
      const body = await res.json();
      // parseInt('2.9', 10) -> 2; parseInt('5.7', 10) -> 5
      expect(body.data).toHaveLength(5);
      expect(body.data[0]).toMatchObject({ firstName: 'First6' });
    });
  
    it('handles pageSize larger than row count by returning all remaining rows', async () => {
      await insertAdvocates(25);
      const rowCount = await db.select({ count: count() }).from(advocates);

      console.log("Current row count: ", rowCount);

      const res = await GET(new Request('http://localhost/api/advocates?page=1&pageSize=50'));
      const body = await res.json();
      expect(body.data).toHaveLength(25);
      expect(body.data[0]).toMatchObject({ firstName: 'First1' });
      expect(body.data[24]).toMatchObject({ firstName: 'First25' });
    });
  });
});

