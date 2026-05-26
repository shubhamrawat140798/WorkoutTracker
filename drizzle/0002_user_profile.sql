CREATE TABLE IF NOT EXISTS "user_profiles" (
  "user_id" uuid PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "gender" text,
  "height_cm" numeric(5, 1),
  "weight_kg" numeric(5, 1),
  "measurements" jsonb DEFAULT '{}'::jsonb,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
