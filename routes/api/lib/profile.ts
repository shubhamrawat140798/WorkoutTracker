import { eq, desc } from 'drizzle-orm'
import { db } from './db'
import { userProfiles, profileSnapshots, type BodyMeasurements } from './schema'

export type UserProfile = {
  userId: string
  gender: string | null
  heightCm: number | null
  weightKg: number | null
  measurements: BodyMeasurements
  updatedAt: string
}

export type ProfileSnapshot = {
  id: string
  recordedAt: string
  heightCm: number | null
  weightKg: number | null
  measurements: BodyMeasurements
}

function formatSnapshot(row: typeof profileSnapshots.$inferSelect): ProfileSnapshot {
  return {
    id: row.id,
    recordedAt: row.recordedAt.toISOString(),
    heightCm: row.heightCm != null ? parseFloat(String(row.heightCm)) : null,
    weightKg: row.weightKg != null ? parseFloat(String(row.weightKg)) : null,
    measurements: (row.measurements as BodyMeasurements) ?? {},
  }
}

function hasTrackableMetrics(data: {
  heightCm: number | null
  weightKg: number | null
  measurements: BodyMeasurements
}) {
  if (data.heightCm != null || data.weightKg != null) return true
  return Object.values(data.measurements).some((v) => v != null && Number(v) > 0)
}

function formatProfile(row: typeof userProfiles.$inferSelect): UserProfile {
  return {
    userId: row.userId,
    gender: row.gender,
    heightCm: row.heightCm != null ? parseFloat(String(row.heightCm)) : null,
    weightKg: row.weightKg != null ? parseFloat(String(row.weightKg)) : null,
    measurements: (row.measurements as BodyMeasurements) ?? {},
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const [row] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1)

  if (!row) {
    return {
      userId,
      gender: null,
      heightCm: null,
      weightKg: null,
      measurements: {},
      updatedAt: new Date().toISOString(),
    }
  }

  return formatProfile(row)
}

export async function upsertUserProfile(
  userId: string,
  data: {
    gender?: string | null
    heightCm?: number | null
    weightKg?: number | null
    measurements?: BodyMeasurements
  },
) {
  const existing = await getUserProfile(userId)

  const merged = {
    gender: data.gender !== undefined ? (data.gender || null) : existing.gender,
    heightCm: data.heightCm !== undefined ? data.heightCm : existing.heightCm,
    weightKg: data.weightKg !== undefined ? data.weightKg : existing.weightKg,
    measurements:
      data.measurements !== undefined
        ? { ...existing.measurements, ...data.measurements }
        : existing.measurements,
  }

  await db
    .insert(userProfiles)
    .values({
      userId,
      gender: merged.gender,
      heightCm: merged.heightCm != null ? String(merged.heightCm) : null,
      weightKg: merged.weightKg != null ? String(merged.weightKg) : null,
      measurements: merged.measurements,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        gender: merged.gender,
        heightCm: merged.heightCm != null ? String(merged.heightCm) : null,
        weightKg: merged.weightKg != null ? String(merged.weightKg) : null,
        measurements: merged.measurements,
        updatedAt: new Date(),
      },
    })

  if (hasTrackableMetrics(merged)) {
    try {
      await db.insert(profileSnapshots).values({
        userId,
        heightCm: merged.heightCm != null ? String(merged.heightCm) : null,
        weightKg: merged.weightKg != null ? String(merged.weightKg) : null,
        measurements: merged.measurements,
      })
    } catch (snapshotErr) {
      console.error('[profile] snapshot insert failed:', snapshotErr)
    }
  }

  return getUserProfile(userId)
}

export async function listProfileSnapshots(userId: string, limit = 60) {
  try {
    const rows = await db
      .select()
      .from(profileSnapshots)
      .where(eq(profileSnapshots.userId, userId))
      .orderBy(desc(profileSnapshots.recordedAt))
      .limit(limit)

    return rows.map(formatSnapshot).reverse()
  } catch {
    return []
  }
}
