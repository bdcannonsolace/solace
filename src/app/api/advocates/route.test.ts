import { describe, it, expect, beforeEach } from 'vitest';
import { insertAdvocates } from '../../../test/factories/advocates';
import db from '../../../db';
import { advocates } from '../../../db/schema';

// We import GET after the setup has run so the app db can point to the test db
import { GET } from './route';

describe('GET /api/advocates', () => {
  describe('return advocates', () => {
    it('returns an empty list there are no records', async () => {
      const res = await GET(new Request('http://localhost/api/advocates'));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({ data: [] });
    });

    it('returns advocates when there are records', async () => {
      const advocates = await insertAdvocates(2);

      const res = await GET(new Request('http://localhost/api/advocates'));
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
      const res = await GET(new Request('http://localhost/api/advocates'));
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
      expect(body.data[0]).toMatchObject({ firstName: 'First1' });
      expect(body.data[49]).toMatchObject({ firstName: 'First50' });
    });
  });

  describe('filters via query params', () => {
    it('filters by firstName and city', async () => {
      await db.insert(advocates).values({
        firstName: 'Target',
        lastName: 'Match',
        city: 'City',
        degree: 'Degree',
        specialties: ['one'],
        yearsOfExperience: 3,
        phoneNumber: 9911111111,
      });

      const resA = await GET(new Request('http://localhost/api/advocates?firstName=Target&city=City'));
      const bodyA = await resA.json();
      expect(bodyA.data).toHaveLength(1);

      await db.insert(advocates).values({
        firstName: 'Zed',
        lastName: 'Nope',
        city: 'Elsewhere',
        degree: 'Degree',
        specialties: ['one'],
        yearsOfExperience: 1,
        phoneNumber: 9922222222,
      });

      const resB = await GET(new Request('http://localhost/api/advocates?firstName=Zed&city=City'));
      const bodyB = await resB.json();
      expect(bodyB.data).toHaveLength(0);
    });

    it('filters by specialties (any match) and yearsOfExperience range', async () => {
      await db.insert(advocates).values([
        { firstName: 'SpecA', lastName: 'A', city: 'X', degree: 'MD', specialties: ['cardio'], yearsOfExperience: 6, phoneNumber: 1111111112 },
        { firstName: 'SpecB', lastName: 'B', city: 'X', degree: 'MD', specialties: ['peds'], yearsOfExperience: 4, phoneNumber: 1111111113 },
      ]);

      const res = await GET(new Request('http://localhost/api/advocates?specialties=cardio,neuro&yearsOfExperience=5-10'));
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0]).toMatchObject({ firstName: 'SpecA' });
    });
  });
});

