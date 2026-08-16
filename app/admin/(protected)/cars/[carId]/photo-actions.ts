"use server"

import { del } from "@vercel/blob"
import { asc, count, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/actions/action-result"
import { getDb } from "@/lib/db/client"
import { carPhotos } from "@/lib/db/schema"

export async function attachCarPhotoAction(carId: string, url: string): Promise<ActionResult<{ photoId: string }>> {
  const db = getDb()

  try {
    const [{ maxPosition }] = await db
      .select({ maxPosition: sql<number>`coalesce(max(${carPhotos.position}), -1)` })
      .from(carPhotos)
      .where(eq(carPhotos.carId, carId))
    const [{ existingCount }] = await db.select({ existingCount: count() }).from(carPhotos).where(eq(carPhotos.carId, carId))

    const [row] = await db
      .insert(carPhotos)
      .values({ carId, url, position: maxPosition + 1, isCover: existingCount === 0 })
      .returning({ id: carPhotos.id })

    revalidatePath(`/admin/cars/${carId}`)
    return { ok: true, data: { photoId: row.id } }
  } catch {
    return { ok: false, error: { code: "DB_ERROR", message: "Não foi possível registrar a foto." } }
  }
}

export async function setCoverPhotoAction(carId: string, photoId: string): Promise<ActionResult<null>> {
  const db = getDb()

  try {
    await db.transaction(async (tx) => {
      await tx.update(carPhotos).set({ isCover: false }).where(eq(carPhotos.carId, carId))
      await tx.update(carPhotos).set({ isCover: true }).where(eq(carPhotos.id, photoId))
    })
    revalidatePath(`/admin/cars/${carId}`)
    return { ok: true, data: null }
  } catch {
    return { ok: false, error: { code: "DB_ERROR", message: "Não foi possível definir a foto de capa." } }
  }
}

export async function deleteCarPhotoAction(photoId: string): Promise<ActionResult<null>> {
  const db = getDb()

  try {
    const [photo] = await db.select().from(carPhotos).where(eq(carPhotos.id, photoId)).limit(1)
    if (!photo) {
      return { ok: false, error: { code: "NOT_FOUND", message: "Foto não encontrada." } }
    }

    await del(photo.url)
    await db.delete(carPhotos).where(eq(carPhotos.id, photoId))

    if (photo.isCover) {
      const [next] = await db
        .select()
        .from(carPhotos)
        .where(eq(carPhotos.carId, photo.carId))
        .orderBy(asc(carPhotos.position))
        .limit(1)
      if (next) {
        await db.update(carPhotos).set({ isCover: true }).where(eq(carPhotos.id, next.id))
      }
    }

    revalidatePath(`/admin/cars/${photo.carId}`)
    return { ok: true, data: null }
  } catch {
    return { ok: false, error: { code: "DB_ERROR", message: "Não foi possível remover a foto." } }
  }
}

export async function reorderCarPhotosAction(carId: string, orderedPhotoIds: string[]): Promise<ActionResult<null>> {
  const db = getDb()

  try {
    await db.transaction(async (tx) => {
      for (let index = 0; index < orderedPhotoIds.length; index += 1) {
        await tx
          .update(carPhotos)
          .set({ position: index })
          .where(eq(carPhotos.id, orderedPhotoIds[index]))
      }
    })
    revalidatePath(`/admin/cars/${carId}`)
    return { ok: true, data: null }
  } catch {
    return { ok: false, error: { code: "DB_ERROR", message: "Não foi possível reordenar as fotos." } }
  }
}
