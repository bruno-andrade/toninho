import { and, asc, desc, eq, gte, inArray, lte, ne, sql } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { carHistory, carInspectionItems, carPhotos, cars } from "@/lib/db/schema"

const PUBLIC_STATUSES = ["available", "reserved", "sold"] as const

/** Só o que pode aparecer na vitrine pública: não-arquivado e já publicado. */
function publicCarConditions() {
  return and(eq(cars.archived, false), inArray(cars.status, PUBLIC_STATUSES))
}

export async function getFeaturedCars(limit = 6) {
  const db = getDb()
  const featured = await db
    .select()
    .from(cars)
    .where(and(publicCarConditions(), eq(cars.featured, true)))
    .orderBy(desc(cars.createdAt))
    .limit(limit)

  if (featured.length >= limit) return featured

  const rest = await db
    .select()
    .from(cars)
    .where(publicCarConditions())
    .orderBy(desc(cars.createdAt))
    .limit(limit)

  const seen = new Set(featured.map((car) => car.id))
  for (const car of rest) {
    if (featured.length >= limit) break
    if (!seen.has(car.id)) {
      featured.push(car)
      seen.add(car.id)
    }
  }
  return featured
}

export type CarFilters = {
  brands?: string[]
  bodyTypes?: string[]
  transmission?: string
  origin?: string
  armored?: boolean
  priceMin?: number
  priceMax?: number
  kmMin?: number
  kmMax?: number
  city?: string
  sort?: "relevancia" | "menor-preco" | "maior-preco" | "menor-km"
  page?: number
}

export const CARS_PAGE_SIZE = 8

export async function getCars(filters: CarFilters) {
  const db = getDb()
  const conditions = [publicCarConditions()]

  if (filters.brands?.length) conditions.push(inArray(cars.brand, filters.brands))
  if (filters.bodyTypes?.length) {
    conditions.push(inArray(cars.bodyType, filters.bodyTypes as (typeof cars.bodyType.enumValues)[number][]))
  }
  if (filters.transmission) {
    conditions.push(eq(cars.transmission, filters.transmission as (typeof cars.transmission.enumValues)[number]))
  }
  if (filters.origin) {
    conditions.push(eq(cars.origin, filters.origin as (typeof cars.origin.enumValues)[number]))
  }
  if (filters.armored) conditions.push(eq(cars.armored, true))
  if (filters.city) conditions.push(eq(cars.city, filters.city))
  if (filters.priceMin != null) conditions.push(gte(sql<number>`${cars.price}::numeric`, filters.priceMin))
  if (filters.priceMax != null) conditions.push(lte(sql<number>`${cars.price}::numeric`, filters.priceMax))
  if (filters.kmMin != null) conditions.push(gte(cars.km, filters.kmMin))
  if (filters.kmMax != null) conditions.push(lte(cars.km, filters.kmMax))

  const where = and(...conditions)

  const orderBy =
    filters.sort === "menor-preco"
      ? [asc(sql`${cars.price}::numeric`)]
      : filters.sort === "maior-preco"
        ? [desc(sql`${cars.price}::numeric`)]
        : filters.sort === "menor-km"
          ? [asc(cars.km)]
          : [desc(cars.featured), desc(cars.createdAt)]

  const page = Math.max(1, filters.page ?? 1)
  const offset = (page - 1) * CARS_PAGE_SIZE

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(cars).where(where).orderBy(...orderBy).limit(CARS_PAGE_SIZE).offset(offset),
    db.select({ total: sql<number>`count(*)`.mapWith(Number) }).from(cars).where(where),
  ])

  return { cars: rows, total, page, pageSize: CARS_PAGE_SIZE, pageCount: Math.max(1, Math.ceil(total / CARS_PAGE_SIZE)) }
}

export async function getCoverPhotoMap(carIds: string[]): Promise<Record<string, string | null>> {
  if (carIds.length === 0) return {}
  const rows = await getDb()
    .select({ carId: carPhotos.carId, url: carPhotos.url })
    .from(carPhotos)
    .where(and(inArray(carPhotos.carId, carIds), eq(carPhotos.isCover, true)))

  const map: Record<string, string | null> = {}
  for (const id of carIds) map[id] = null
  for (const row of rows) map[row.carId] = row.url
  return map
}

export async function getBrandFacets() {
  const db = getDb()
  const rows = await db
    .select({ brand: cars.brand, count: sql<number>`count(*)`.mapWith(Number) })
    .from(cars)
    .where(publicCarConditions())
    .groupBy(cars.brand)
    .orderBy(asc(cars.brand))
  return rows
}

export async function getCarBySlug(slug: string) {
  const db = getDb()
  const [car] = await db.select().from(cars).where(and(eq(cars.slug, slug), publicCarConditions())).limit(1)
  if (!car) return null

  const [photos, inspection, history] = await Promise.all([
    db.select().from(carPhotos).where(eq(carPhotos.carId, car.id)).orderBy(asc(carPhotos.position)),
    db.select().from(carInspectionItems).where(eq(carInspectionItems.carId, car.id)),
    db.select().from(carHistory).where(eq(carHistory.carId, car.id)).limit(1),
  ])

  return { car, photos, inspection, history: history[0] ?? null }
}

export async function getRelatedCars(car: { id: string; bodyType: string }, limit = 4) {
  const db = getDb()
  return db
    .select()
    .from(cars)
    .where(and(publicCarConditions(), ne(cars.id, car.id), eq(cars.bodyType, car.bodyType as (typeof cars.bodyType.enumValues)[number])))
    .orderBy(desc(cars.createdAt))
    .limit(limit)
}
