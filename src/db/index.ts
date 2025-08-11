import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

const setup = (): PostgresJsDatabase => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const url = process.env.DATABASE_URL;
  
  const queryClient = postgres(url, { max: 1 });
  const db = drizzle(queryClient, { logger: true });

  return db;
};

export default setup();
