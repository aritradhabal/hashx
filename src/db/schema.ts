import {
  pgTable,
  serial,
  varchar,
  bigint,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const secrets = pgTable("secrets", {
  marketId: bigint("market_id", { mode: "bigint" }).notNull().primaryKey(),
  secretKey: varchar("secret_key", { length: 80 }).notNull(),
  N: varchar("n", { length: 2050 }).notNull(),
  t: bigint("t", { mode: "bigint" }).notNull(),
  a: integer("a").notNull(),
  skLocked: varchar("sk_locked", { length: 80 }).notNull(),
  hashedSK: varchar("hashed_sk", { length: 80 }).notNull(),
  publicKey: varchar("public_key", { length: 80 }).notNull(),
  verified: boolean("verified").notNull().default(false),
  server: boolean("server").notNull(),
});
