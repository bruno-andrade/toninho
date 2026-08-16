"use server"

import { and, eq, inArray } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { cars } from "@/lib/db/schema"
import { getCoverPhotoMap } from "@/lib/site/queries"

export async function getFavoriteCarsAction(carIds: string[]) {
  if (carIds.length === 0) return { cars: [], coverByCarId: {} }

  const rows = await getDb()
    .select()
    .from(cars)
    .where(and(inArray(cars.id, carIds), eq(cars.archived, false)))

  const coverByCarId = await getCoverPhotoMap(rows.map((car) => car.id))
  return { cars: rows, coverByCarId }
}
