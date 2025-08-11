import db from '../../db';
import { advocates } from '../../db/schema';

export type Advocate = typeof advocates.$inferSelect;

export function makeAdvocate(n: number) {
  return {
    firstName: `First${n}`,
    lastName: `Last${n}`,
    city: 'City',
    degree: 'Degree',
    specialties: ['one'] as string[],
    yearsOfExperience: 1 + (n % 30),
    phoneNumber: 1000000000 + n,
  };
}

export async function insertAdvocates(count: number): Promise<Advocate[]> {
  const rows = Array.from({ length: count }, (_, i) => makeAdvocate(i + 1));
  const inserted = await db.insert(advocates).values(rows).returning();
  return inserted;
}


