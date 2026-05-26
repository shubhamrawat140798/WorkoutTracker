import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  decimal,
  boolean,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull(),
    role: text('role').notNull().default('user'),
    resetTokenHash: text('reset_token_hash'),
    resetTokenExpiresAt: timestamp('reset_token_expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('users_email_idx').on(table.email)],
)

export const workouts = pgTable('workouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  title: text('title').notNull().default('Workout'),
  notes: text('notes'),
  durationMinutes: integer('duration_minutes'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const exercises = pgTable('exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  workoutId: uuid('workout_id')
    .notNull()
    .references(() => workouts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const exerciseCatalog = pgTable(
  'exercise_catalog',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    primaryMuscle: text('primary_muscle'),
    secondaryMuscles: jsonb('secondary_muscles').$type<string[]>().default([]),
    equipment: text('equipment'),
    level: text('level'),
    instructions: jsonb('instructions').$type<string[]>().default([]),
    tips: jsonb('tips').$type<string[]>().default([]),
    heroImageUrl: text('hero_image_url'),
    stepImageUrls: jsonb('step_image_urls').$type<string[]>().default([]),
    published: boolean('published').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('exercise_catalog_slug_idx').on(table.slug)],
)

export const sets = pgTable('sets', {
  id: uuid('id').primaryKey().defaultRandom(),
  exerciseId: uuid('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(),
  reps: integer('reps'),
  weight: decimal('weight', { precision: 8, scale: 2 }),
  weightUnit: text('weight_unit').notNull().default('kg'),
  rpe: integer('rpe'),
  notes: text('notes'),
})

export type BodyMeasurements = {
  chest?: number | null
  waist?: number | null
  hips?: number | null
  biceps?: number | null
  thighs?: number | null
  neck?: number | null
}

export const profileSnapshots = pgTable('profile_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
  heightCm: decimal('height_cm', { precision: 5, scale: 1 }),
  weightKg: decimal('weight_kg', { precision: 5, scale: 1 }),
  measurements: jsonb('measurements').$type<BodyMeasurements>().default({}),
})

export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  gender: text('gender'),
  heightCm: decimal('height_cm', { precision: 5, scale: 1 }),
  weightKg: decimal('weight_kg', { precision: 5, scale: 1 }),
  measurements: jsonb('measurements').$type<BodyMeasurements>().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ one, many }) => ({
  workouts: many(workouts),
  profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
  profileSnapshots: many(profileSnapshots),
}))

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, { fields: [workouts.userId], references: [users.id] }),
  exercises: many(exercises),
}))

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  workout: one(workouts, { fields: [exercises.workoutId], references: [workouts.id] }),
  sets: many(sets),
}))

export const setsRelations = relations(sets, ({ one }) => ({
  exercise: one(exercises, { fields: [sets.exerciseId], references: [exercises.id] }),
}))
