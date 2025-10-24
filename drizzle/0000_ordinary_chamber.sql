CREATE TABLE "proofs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_address" varchar(80) NOT NULL,
	"contract_address" varchar(80) NOT NULL,
	"merkle_proofs" varchar(150) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "secrets" (
	"market_id" bigint PRIMARY KEY NOT NULL,
	"secret_key" varchar(80) NOT NULL,
	"n" varchar(2050) NOT NULL,
	"t" bigint NOT NULL,
	"a" integer NOT NULL,
	"sk_locked" varchar(80) NOT NULL,
	"hashed_sk" varchar(80) NOT NULL,
	"public_key" varchar(80) NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"server" boolean NOT NULL,
	"contract_address" varchar(80),
	"option_a" bigint,
	"option_b" bigint,
	"rewards" bigint,
	"startTimeStamp" bigint,
	"endTimeStamp" bigint,
	"solver" varchar(80),
	"unlocked_secret" varchar(80),
	"resolved_option" bigint
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_address" varchar(80) PRIMARY KEY NOT NULL,
	"voted" boolean DEFAULT false NOT NULL,
	"claimed" boolean DEFAULT false NOT NULL
);
