import { describe, it, expect } from 'vitest';
import { advocates } from '../../../db/schema';
import { listAdvocates } from './service';
import db from '../../../db';

describe('advocates service - listAdvocates', () => {
  it('returns empty when there are no advocates', async () => {
    const rows = await listAdvocates(1, 10, db);
    expect(rows).toEqual([]);
  });

  it('paginates results', async () => {
    await db.insert(advocates).values([
      {
        firstName: 'Ada',
        lastName: 'Lovelace',
        city: 'London',
        degree: 'Mathematics',
        specialties: ['algorithms'],
        yearsOfExperience: 10,
        phoneNumber: 1111111111,
      },
      {
        firstName: 'Grace',
        lastName: 'Hopper',
        city: 'New York',
        degree: 'Mathematics',
        specialties: ['compilers'],
        yearsOfExperience: 15,
        phoneNumber: 2222222222,
      },
      {
        firstName: 'Linus',
        lastName: 'Torvalds',
        city: 'Helsinki',
        degree: 'CS',
        specialties: ['kernels'],
        yearsOfExperience: 20,
        phoneNumber: 3333333333,
      },
    ]);

    const page1 = await listAdvocates(1, 2, db);
    const page2 = await listAdvocates(2, 2, db);

    expect(page1).toHaveLength(2);
    expect(page1[0]).toMatchObject({ firstName: 'Ada' });
    expect(page1[1]).toMatchObject({ firstName: 'Grace' });
    
    expect(page2).toHaveLength(1);
    expect(page2[0]).toMatchObject({ firstName: 'Linus' });
  });
});


