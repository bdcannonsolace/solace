import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  jsonb,
  serial,
  timestamp,
  bigint,
  index,
} from "drizzle-orm/pg-core";

// Why is phone number a bigint?
// Why is specialties named payload?
const advocates = pgTable("advocates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  degree: text("degree").notNull(),
  specialties: jsonb("payload").$type<string[]>().default([]).notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('first_name_idx').on(table.firstName),
  index('last_name_idx').on(table.lastName),
  index('city_idx').on(table.city),
  index('degree_idx').on(table.degree),
  index('specialties_idx').using('gin', table.specialties),
  index('years_of_experience_idx').on(table.yearsOfExperience),
  index('phone_number_idx').on(table.phoneNumber),
]);

export { advocates };
