import { describe, it, expect } from 'vitest';
import { listAdvocates } from './service';
import { insertAdvocates } from '../../../test/factories/advocates';
import db from '../../../db';
import { advocates } from '../../../db/schema';

describe('advocates service - listAdvocates', () => {
  it('returns empty when there are no advocates', async () => {
    const rows = await listAdvocates(1, 10, db);
    expect(rows).toEqual([]);
  });

  it('paginates results', async () => {
    await insertAdvocates(3);

    const page1 = await listAdvocates(1, 2, db);
    const page2 = await listAdvocates(2, 2, db);

    expect(page1).toHaveLength(2);
    expect(page1[0]).toMatchObject({ firstName: 'First1' });
    expect(page1[1]).toMatchObject({ firstName: 'First2' });

    expect(page2).toHaveLength(1);
    expect(page2[0]).toMatchObject({ firstName: 'First3' });
  });

  describe('filters', () => {
    it('filters by partial firstName (case-insensitive)', async () => {
      await db.insert(advocates).values([
        {
          firstName: 'Alice',
          lastName: 'Smith',
          city: 'City',
          degree: 'Degree',
          specialties: ['one'],
          yearsOfExperience: 3,
          phoneNumber: 1111111111,
        },
        {
          firstName: 'Alicia',
          lastName: 'Jones',
          city: 'City',
          degree: 'Degree',
          specialties: ['one'],
          yearsOfExperience: 4,
          phoneNumber: 2222222222,
        },
        {
          firstName: 'Bob',
          lastName: 'Brown',
          city: 'City',
          degree: 'Degree',
          specialties: ['one'],
          yearsOfExperience: 5,
          phoneNumber: 3333333333,
        },
      ]);

      const rows = await listAdvocates(1, 10, db, { firstName: 'ali' });
      expect(rows).toHaveLength(2);
      expect(rows.map((r) => r.firstName).sort()).toEqual(['Alice', 'Alicia']);
    });

    it('filters by specialties (matches any of provided values)', async () => {
      await db.insert(advocates).values([
        {
          firstName: 'Carl',
          lastName: 'Jones',
          city: 'City',
          degree: 'MD',
          specialties: ['cardio'],
          yearsOfExperience: 7,
          phoneNumber: 4444444444,
        },
        {
          firstName: 'Pat',
          lastName: 'Tillman',
          city: 'City',
          degree: 'MD',
          specialties: ['peds'],
          yearsOfExperience: 2,
          phoneNumber: 5555555555,
        },
      ]);

      const rows = await listAdvocates(1, 10, db, { specialties: ['cardio', 'neuro'] });
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ firstName: 'Carl' });
    });

    it('filters by years of experience range (inclusive)', async () => {
      await db.insert(advocates).values([
        {
          firstName: 'Y3',
          lastName: 'A',
          city: 'City',
          degree: 'Degree',
          specialties: ['one'],
          yearsOfExperience: 3,
          phoneNumber: 6666666666,
        },
        {
          firstName: 'Y5',
          lastName: 'B',
          city: 'City',
          degree: 'Degree',
          specialties: ['one'],
          yearsOfExperience: 5,
          phoneNumber: 7777777777,
        },
        {
          firstName: 'Y8',
          lastName: 'C',
          city: 'City',
          degree: 'Degree',
          specialties: ['one'],
          yearsOfExperience: 8,
          phoneNumber: 8888888888,
        },
      ]);

      const rows = await listAdvocates(1, 10, db, {
        minYearsOfExperience: 5,
        maxYearsOfExperience: 8,
      });
      expect(rows.map((r) => r.firstName).sort()).toEqual(['Y5', 'Y8']);
    });
  });
});


