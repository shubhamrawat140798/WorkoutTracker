CREATE TABLE IF NOT EXISTS "profile_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "recorded_at" timestamptz DEFAULT now() NOT NULL,
  "height_cm" numeric(5, 1),
  "weight_kg" numeric(5, 1),
  "measurements" jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS "profile_snapshots_user_recorded_idx" ON "profile_snapshots" ("user_id", "recorded_at");
