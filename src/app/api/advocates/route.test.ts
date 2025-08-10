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
  };
}

const insertAdvocates = async (count: number): Promise<Advocate[]> => {
  const rows = Array.from({ length: count }, (_, i) => makeAdvocate(i + 1));
  const insertedAdvocates = await db.insert(advocates).values(rows).returning();

  return insertedAdvocates;
};

describe('GET /api/advocates', () => {
  describe('return advocates', () => {
    it('returns an empty list there are no records', async () => {
      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({ data: [] });
    });

    it('returns advocates when there are records', async () => {
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
    beforeEach(async () => {
      // At the moment a default page size is 10
      await insertAdvocates(65);
    });

    it('uses defaults when no query params: returns first 10 ordered by id asc', async () => {
      const res = await GET();
      const body = await res.json();

      expect(body.data).toHaveLength(10);
      expect(body.data[0]).toMatchObject({ firstName: 'First1', lastName: 'Last1' });
      expect(body.data[9]).toMatchObject({ firstName: 'First10', lastName: 'Last10' });
    });

  
    it('can set pageSize', async () => {
      const res = await GET(new Request('http://localhost/api/advocates?pageSize=10'));
      const body = await res.json();

      expect(body.data).toHaveLength(10);
      expect(body.data[0]).toMatchObject({ firstName: 'First1' });
      expect(body.data[4]).toMatchObject({ firstName: 'First5' });
      expect(body.data[9]).toMatchObject({ firstName: 'First10' });
    });
  
    it('can set page and pageSize independently', async () => {
      const res = await GET(new Request('http://localhost/api/advocates?page=3&pageSize=5'));
      const body = await res.json();

      expect(body.data).toHaveLength(5);
      expect(body.data[0]).toMatchObject({ firstName: 'First11' });
      expect(body.data[4]).toMatchObject({ firstName: 'First15' });
    });
  
    it('falls back to defaults when page is invalid (0, negative, non-numeric)', async () => {
      const invalidPages = [
        '0',
        '-3',
        'abc',
      ];
  
      for (const page of invalidPages) {
        const res = await GET(new Request(`http://localhost/api/advocates?page=${page}&pageSize=5`));
        const body = await res.json();

        expect(body.data).toHaveLength(5);
        expect(body.data[0]).toMatchObject({ firstName: 'First1' });
      }
    });
  
    it('falls back to default pageSize when pageSize is invalid (0, negative, non-numeric)', async () => {
      const invalidPageSizes = [
        '0',
        '-10',
        'abc',
      ];
  
      for (const pageSize of invalidPageSizes) {
        const res = await GET(new Request(`http://localhost/api/advocates?pageSize=${pageSize}`));
        const body = await res.json();

        expect(body.data).toHaveLength(10);
        expect(body.data[0]).toMatchObject({ firstName: 'First1' });
      }
    });
  
    it('returns an empty array when when it has been paged out of range', async () => {
      const res = await GET(new Request('http://localhost/api/advocates?page=6&pageSize=20'));
      const body = await res.json();

      expect(body.data).toHaveLength(0);
    });
  
    it('returns the default max records when the set page size is greater than the max records', async () => {
      const res = await GET(new Request('http://localhost/api/advocates?pageSize=100'));
      const body = await res.json();

      expect(body.data).toHaveLength(50);
      console.log(body.data);
      expect(body.data[0]).toMatchObject({ firstName: 'First1' });
      expect(body.data[49]).toMatchObject({ firstName: 'First50' });
    });
  });
});

