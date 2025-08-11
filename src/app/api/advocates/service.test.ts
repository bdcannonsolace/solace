import { describe, it, expect } from 'vitest';
import { listAdvocates } from './service';
import { insertAdvocates } from '../../../test/factories/advocates';
import db from '../../../db';

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
});


