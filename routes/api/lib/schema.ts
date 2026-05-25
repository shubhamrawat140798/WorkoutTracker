import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  decimal,
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

export const usersRelations = relations(users, ({ many }) => ({
  workouts: many(workouts),
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
