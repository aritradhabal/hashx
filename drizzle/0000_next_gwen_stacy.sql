CREATE TABLE "secrets" (
	"id" serial PRIMARY KEY NOT NULL,
	"market_id" bigint NOT NULL,
	"secret_key" varchar(80) NOT NULL,
	"n" varchar(2050) NOT NULL,
	"t" bigint NOT NULL,
	"a" integer NOT NULL,
	"sk_locked" varchar(80) NOT NULL,
	"hashed_sk" varchar(80) NOT NULL,
	"public_key" varchar(80) NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"server" boolean NOT NULL
);
