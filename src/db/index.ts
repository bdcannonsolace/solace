import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

type FallbackDb = {
  select: () => {
    from: () => any[];
  };
  insert: (_: unknown) => {
    values: (_: unknown) => {
      returning: () => any[];
    };
  };
};

const setup = (): PostgresJsDatabase | FallbackDb => {
  if (!process.env.DATABASE_URL) {
    return {
      select: () => ({
        from: () => [],
      }),
      insert: () => ({
        values: () => ({
          returning: () => [],
        }),
      }),
    };
  } else {
    const queryClient = postgres(process.env.DATABASE_URL);
    const db = drizzle(queryClient);

    return db;
  }
};

export default setup();
