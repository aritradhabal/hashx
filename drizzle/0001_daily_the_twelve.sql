ALTER TABLE "secrets" ADD COLUMN "solver" varchar(80);--> statement-breakpoint
ALTER TABLE "secrets" ADD COLUMN "unlocked_secret" varchar(80);--> statement-breakpoint
ALTER TABLE "secrets" ADD COLUMN "resolved_option" bigint;