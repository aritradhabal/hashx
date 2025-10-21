CREATE TABLE "secrets" (
	"id" serial PRIMARY KEY NOT NULL,
	"secret_key" varchar(66) NOT NULL,
	"voting_contract_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votingContracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"market_id" bigint NOT NULL,
	"option_a" bigint NOT NULL,
	"option_b" bigint NOT NULL,
	"rewards" bigint NOT NULL,
	"start_timestamp" bigint NOT NULL,
	"end_timestamp" bigint NOT NULL,
	"threshold_votes" integer NOT NULL,
	"hbar_locking_contract_address" varchar(66) NOT NULL,
	"n" varchar(1024) NOT NULL,
	"t" bigint NOT NULL,
	"a" integer NOT NULL,
	"sk_locked" varchar(66) NOT NULL,
	"hashed_sk" varchar(66) NOT NULL,
	"contract_address" varchar(66) NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"server" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "secrets" ADD CONSTRAINT "secrets_voting_contract_id_votingContracts_id_fk" FOREIGN KEY ("voting_contract_id") REFERENCES "public"."votingContracts"("id") ON DELETE cascade ON UPDATE no action;