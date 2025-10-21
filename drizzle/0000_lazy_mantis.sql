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
	"endTimeStamp" bigint
);
