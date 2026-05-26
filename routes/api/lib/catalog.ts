import { eq, desc, ilike, and } from 'drizzle-orm'
import { db } from './db'
import { exerciseCatalog } from './schema'
import { slugify } from './slug'

export type CatalogRow = typeof exerciseCatalog.$inferSelect

export function formatCatalog(row: CatalogRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    primaryMuscle: row.primaryMuscle,
    secondaryMuscles: (row.secondaryMuscles as string[]) ?? [],
    equipment: row.equipment,
    level: row.level,
    instructions: (row.instructions as string[]) ?? [],
    tips: (row.tips as string[]) ?? [],
    heroImageUrl: row.heroImageUrl,
    stepImageUrls: (row.stepImageUrls as string[]) ?? [],
    published: row.published,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function listCatalog(publishedOnly: boolean) {
  const query = db.select().from(exerciseCatalog).orderBy(desc(exerciseCatalog.updatedAt))
  const rows = publishedOnly
    ? await query.where(eq(exerciseCatalog.published, true))
    : await query

  return rows.map(formatCatalog)
}

export async function getCatalogBySlug(slug: string, publishedOnly: boolean) {
  const [row] = await db
    .select()
    .from(exerciseCatalog)
    .where(
      publishedOnly
        ? and(eq(exerciseCatalog.slug, slug), eq(exerciseCatalog.published, true))
        : eq(exerciseCatalog.slug, slug),
    )
    .limit(1)

  return row ? formatCatalog(row) : null
}

export async function getCatalogByName(name: string, publishedOnly: boolean) {
  const slug = slugify(name)
  const bySlug = await getCatalogBySlug(slug, publishedOnly)
  if (bySlug) return bySlug

  const [row] = await db
    .select()
    .from(exerciseCatalog)
    .where(
      publishedOnly
        ? and(ilike(exerciseCatalog.name, name), eq(exerciseCatalog.published, true))
        : ilike(exerciseCatalog.name, name),
    )
    .limit(1)

  return row ? formatCatalog(row) : null
}

export async function getCatalogById(id: string) {
  const [row] = await db.select().from(exerciseCatalog).where(eq(exerciseCatalog.id, id)).limit(1)
  return row ? formatCatalog(row) : null
}

export async function createCatalog(data: {
  name: string
  slug?: string
  primaryMuscle?: string | null
  secondaryMuscles: string[]
  equipment?: string | null
  level?: string | null
  instructions: string[]
  tips: string[]
  heroImageUrl?: string | null
  stepImageUrls: string[]
  published: boolean
}) {
  const slug = data.slug || slugify(data.name)
  const now = new Date()

  const [row] = await db
    .insert(exerciseCatalog)
    .values({
      slug,
      name: data.name,
      primaryMuscle: data.primaryMuscle ?? null,
      secondaryMuscles: data.secondaryMuscles,
      equipment: data.equipment ?? null,
      level: data.level ?? null,
      instructions: data.instructions,
      tips: data.tips,
      heroImageUrl: data.heroImageUrl || null,
      stepImageUrls: data.stepImageUrls,
      published: data.published,
      updatedAt: now,
    })
    .returning()

  return formatCatalog(row)
}

export async function updateCatalog(
  id: string,
  data: Partial<{
    name: string
    slug: string
    primaryMuscle: string | null
    secondaryMuscles: string[]
    equipment: string | null
    level: string | null
    instructions: string[]
    tips: string[]
    heroImageUrl: string | null
    stepImageUrls: string[]
    published: boolean
  }>,
) {
  const [row] = await db
    .update(exerciseCatalog)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(exerciseCatalog.id, id))
    .returning()

  return row ? formatCatalog(row) : null
}

export async function deleteCatalog(id: string) {
  const deleted = await db.delete(exerciseCatalog).where(eq(exerciseCatalog.id, id)).returning({ id: exerciseCatalog.id })
  return deleted.length > 0
}
