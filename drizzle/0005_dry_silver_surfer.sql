CREATE TABLE "prediction_markets" (
	"market_id" bigint PRIMARY KEY NOT NULL,
	"market_address" varchar(80) NOT NULL,
	"question" text NOT NULL,
	"description" text NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL
);
