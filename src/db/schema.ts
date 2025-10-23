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
  contractAddress: varchar("contract_address", { length: 80 }),
  optionA: bigint("option_a", { mode: "bigint" }),
  optionB: bigint("option_b", { mode: "bigint" }),
  rewards: bigint("rewards", { mode: "bigint" }),
  startTimeStamp: bigint("startTimeStamp", { mode: "bigint" }),
  endTimestamp: bigint("endTimeStamp", { mode: "bigint" }),

  solver: varchar("solver", { length: 80 }),
  unlockedSecret: varchar("unlocked_secret", { length: 80 }),
  resolvedOption: bigint("resolved_option", { mode: "bigint" }),
});

export const users = pgTable("users", {
  address: varchar("user_address", { length: 80 }).notNull().primaryKey(),
  publicKey: varchar("public_key", { length: 80 }).notNull(),
  option: bigint("option", { mode: "bigint" }),
});

export const userMarkets = pgTable("user_markets", {
  id: serial("id").primaryKey(),
  userAddress: varchar("user_address", { length: 80 })
    .notNull()
    .references(() => users.address, { onDelete: "cascade" }),
  marketId: bigint("market_id", { mode: "bigint" }).notNull(),
  voted: boolean("voted").notNull().default(false),
  option: bigint("option", { mode: "bigint" }).notNull(),
});
