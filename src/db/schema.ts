import {
  pgTable,
  serial,
  varchar,
  bigint,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const votingContracts = pgTable("votingContracts", {
  id: serial("id").primaryKey(),

  marketId: bigint("market_id", { mode: "bigint" }).notNull(),
  optionA: bigint("option_a", { mode: "bigint" }).notNull(),
  optionB: bigint("option_b", { mode: "bigint" }).notNull(),
  rewards: bigint("rewards", { mode: "bigint" }).notNull(),
  startTimestamp: bigint("start_timestamp", { mode: "bigint" }).notNull(),
  endTimestamp: bigint("end_timestamp", { mode: "bigint" }).notNull(),
  thresholdVotes: integer("threshold_votes").notNull(),

  hbarLockingContractAddress: varchar("hbar_locking_contract_address", {
    length: 66,
  }).notNull(),
  N: varchar("n", { length: 1024 }).notNull(),
  t: bigint("t", { mode: "bigint" }).notNull(),
  a: integer("a").notNull(),
  skLocked: varchar("sk_locked", { length: 66 }).notNull(),
  hashedSK: varchar("hashed_sk", { length: 66 }).notNull(),

  contractAddress: varchar("contract_address", { length: 66 }).notNull(),
  verified: boolean("verified").notNull().default(false),
  server: boolean("server").notNull().default(false),
});

export const secrets = pgTable("secrets", {
  id: serial("id").primaryKey(),
  secretKey: varchar("secret_key", { length: 66 }).notNull(),

  votingContractId: integer("voting_contract_id")
    .notNull()
    .references(() => votingContracts.id, { onDelete: "cascade" }),
});

export const votingContractsRelations = relations(
  votingContracts,
  ({ one }) => ({
    secret: one(secrets, {
      fields: [votingContracts.id],
      references: [secrets.votingContractId],
    }),
  })
);

export const secretsRelations = relations(secrets, ({ one }) => ({
  votingContract: one(votingContracts, {
    fields: [secrets.votingContractId],
    references: [votingContracts.id],
  }),
}));
