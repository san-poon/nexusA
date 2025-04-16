DO $$ BEGIN
 CREATE TYPE "public"."block_status_enum" AS ENUM('active', 'archived', 'flagged_for_review', 'deleted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."block_type_enum" AS ENUM('paragraph', 'heading', 'list', 'list_item', 'quote', 'code', 'image', 'mcq', 'collapsible', 'equation', 'table', 'horizontal_rule');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."content_version_status_enum" AS ENUM('draft', 'approved', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."feedback_type_enum" AS ENUM('LIKE', 'DISLIKE', 'FLAG');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."flag_reason_enum" AS ENUM('INACCURATE', 'OUTDATED', 'UNCLEAR', 'BROKEN_INTERACTIVITY', 'COPYRIGHT_VIOLATION', 'SPAM', 'OTHER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."flag_status_enum" AS ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED_ACCEPTED', 'RESOLVED_REJECTED', 'RESOLVED_DUPLICATE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."history_event_enum" AS ENUM('CREATE', 'MAJOR_EDIT', 'MINOR_EDIT', 'DELETE', 'RESTORE', 'STATUS_CHANGE', 'OWNERSHIP_TRANSFER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."submission_status_enum" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "block_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_id" uuid NOT NULL,
	"content_version_id" uuid NOT NULL,
	"toc_item_id" uuid NOT NULL,
	"block_type" "block_type_enum" NOT NULL,
	"block_value_snapshot" numeric(10, 2) NOT NULL,
	"block_reputation_score_snapshot" numeric(5, 2) DEFAULT '50' NOT NULL,
	"ownership_snapshot" jsonb NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "block_versions_block_id_content_version_id_unique" UNIQUE("block_id","content_version_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blocks" (
	"block_id" uuid PRIMARY KEY NOT NULL,
	"course_id" varchar NOT NULL,
	"original_creator_id" uuid NOT NULL,
	"creation_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"block_type" "block_type_enum" NOT NULL,
	"status" "block_status_enum" DEFAULT 'active' NOT NULL,
	"content_unit_id" uuid,
	"last_modifier_id" uuid,
	"last_modified_timestamp" timestamp with time zone,
	"block_weight" numeric(5, 2) NOT NULL,
	"block_content_value" numeric(5, 2) DEFAULT '0' NOT NULL,
	"block_value" numeric(10, 2) DEFAULT '0' NOT NULL,
	"deleted_at" timestamp with time zone,
	"last_known_content_hash" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contribution_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"event" "history_event_enum" NOT NULL,
	"details" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"feedback_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_version_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"feedback_type" "feedback_type_enum" NOT NULL,
	"flag_reason" "flag_reason_enum",
	"flag_comment" text,
	"flag_status" "flag_status_enum" DEFAULT 'OPEN' NOT NULL,
	"resolver_id" uuid,
	"resolved_at" timestamp with time zone,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ownership" (
	"block_version_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "ownership_block_version_id_user_id_pk" PRIMARY KEY("block_version_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pending_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"toc_item_id" uuid NOT NULL,
	"lexical_state_json" jsonb NOT NULL,
	"status" "submission_status_enum" DEFAULT 'pending' NOT NULL,
	"is_potential_recreation" boolean DEFAULT false NOT NULL,
	"potential_original_block_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"contributor_reputation_score" numeric(10, 2) DEFAULT '0' NOT NULL,
	"can_approve" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "content_versions" ADD COLUMN "status" "content_version_status_enum" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "block_versions" ADD CONSTRAINT "block_versions_block_id_blocks_block_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."blocks"("block_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "block_versions" ADD CONSTRAINT "block_versions_content_version_id_content_versions_id_fk" FOREIGN KEY ("content_version_id") REFERENCES "public"."content_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "block_versions" ADD CONSTRAINT "block_versions_toc_item_id_toc_items_id_fk" FOREIGN KEY ("toc_item_id") REFERENCES "public"."toc_items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blocks" ADD CONSTRAINT "blocks_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blocks" ADD CONSTRAINT "blocks_original_creator_id_users_id_fk" FOREIGN KEY ("original_creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blocks" ADD CONSTRAINT "blocks_content_unit_id_content_units_id_fk" FOREIGN KEY ("content_unit_id") REFERENCES "public"."content_units"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blocks" ADD CONSTRAINT "blocks_last_modifier_id_users_id_fk" FOREIGN KEY ("last_modifier_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contribution_history" ADD CONSTRAINT "contribution_history_block_id_blocks_block_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."blocks"("block_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contribution_history" ADD CONSTRAINT "contribution_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_block_version_id_block_versions_id_fk" FOREIGN KEY ("block_version_id") REFERENCES "public"."block_versions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_resolver_id_users_id_fk" FOREIGN KEY ("resolver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ownership" ADD CONSTRAINT "ownership_block_version_id_block_versions_id_fk" FOREIGN KEY ("block_version_id") REFERENCES "public"."block_versions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ownership" ADD CONSTRAINT "ownership_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pending_submissions" ADD CONSTRAINT "pending_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pending_submissions" ADD CONSTRAINT "pending_submissions_toc_item_id_toc_items_id_fk" FOREIGN KEY ("toc_item_id") REFERENCES "public"."toc_items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pending_submissions" ADD CONSTRAINT "pending_submissions_potential_original_block_id_blocks_block_id_fk" FOREIGN KEY ("potential_original_block_id") REFERENCES "public"."blocks"("block_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "block_versions_block_id_idx" ON "block_versions" USING btree ("block_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "block_versions_content_version_id_idx" ON "block_versions" USING btree ("content_version_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blocks_status_idx" ON "blocks" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blocks_block_type_idx" ON "blocks" USING btree ("block_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blocks_deleted_at_idx" ON "blocks" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blocks_hash_idx" ON "blocks" USING btree ("last_known_content_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blocks_status_deleted_at_idx" ON "blocks" USING btree ("status","deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contribution_history_block_id_idx" ON "contribution_history" USING btree ("block_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contribution_history_user_id_idx" ON "contribution_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contribution_history_event_idx" ON "contribution_history" USING btree ("event");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feedback_block_version_id_idx" ON "feedback" USING btree ("block_version_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feedback_user_id_idx" ON "feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feedback_feedback_type_idx" ON "feedback" USING btree ("feedback_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feedback_flag_status_idx" ON "feedback" USING btree ("flag_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ownership_user_id_idx" ON "ownership" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pending_submissions_user_id_idx" ON "pending_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pending_submissions_toc_item_id_idx" ON "pending_submissions" USING btree ("toc_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pending_submissions_status_idx" ON "pending_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "toc_items_branch_parent_idx" ON "toc_items" USING btree ("branch_id","parent_toc_item_id");