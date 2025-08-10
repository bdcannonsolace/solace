// src/test/isolation.test.ts
import { describe, it, expect } from 'vitest';
import db from '../db';
import { advocates } from '../db/schema';

describe('DB isolation via SAVEPOINTs', () => {
  it('Test A: inserts one row', async () => {
    await db.insert(advocates).values({
      firstName: 'Isolated',
      lastName: 'TestA',
      city: 'Nowhere',
      degree: 'None',
      specialties: [],
      yearsOfExperience: 1,
      phoneNumber: 123,
    });
    const rows = await db.select().from(advocates);

    expect(rows).toHaveLength(1);
  });

  it('Test B: sees a clean slate after Test A', async () => {
    const rows = await db.select().from(advocates);
    
    expect(rows).toHaveLength(0);
  });
});
