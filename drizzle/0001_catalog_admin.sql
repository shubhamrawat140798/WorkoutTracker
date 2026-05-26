ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user' NOT NULL;

CREATE TABLE IF NOT EXISTS "exercise_catalog" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "primary_muscle" text,
  "secondary_muscles" jsonb DEFAULT '[]'::jsonb,
  "equipment" text,
  "level" text,
  "instructions" jsonb DEFAULT '[]'::jsonb,
  "tips" jsonb DEFAULT '[]'::jsonb,
  "hero_image_url" text,
  "step_image_urls" jsonb DEFAULT '[]'::jsonb,
  "published" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "exercise_catalog_slug_idx" ON "exercise_catalog" ("slug");
