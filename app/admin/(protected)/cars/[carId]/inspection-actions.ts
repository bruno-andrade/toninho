"use server"

import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/actions/action-result"
import { getDb } from "@/lib/db/client"
import { carInspectionItems } from "@/lib/db/schema"

const CATEGORIES = [
  "motor_cambio",
  "estrutura_lataria",
  "pintura",
  "pneus_rodas",
  "eletrica",
  "documentacao",
] as const
const STATUSES = ["aprovado", "reparo_leve", "atencao"] as const

export type InspectionItemInput = {
  category: (typeof CATEGORIES)[number]
  status: (typeof STATUSES)[number]
  note?: string
}

export async function updateInspectionItemsAction(
  carId: string,
  items: InspectionItemInput[]
): Promise<ActionResult<null>> {
  const categoriesSeen = new Set(items.map((item) => item.category))
  const hasAllCategories = CATEGORIES.length === items.length && CATEGORIES.every((c) => categoriesSeen.has(c))
  const hasValidStatuses = items.every((item) => (STATUSES as readonly string[]).includes(item.status))

  if (!hasAllCategories || !hasValidStatuses) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "Envie as 6 categorias do laudo, com status válido." } }
  }

  try {
    const db = getDb()
    for (const item of items) {
      await db
        .insert(carInspectionItems)
        .values({ carId, category: item.category, status: item.status, note: item.note || null })
        .onConflictDoUpdate({
          target: [carInspectionItems.carId, carInspectionItems.category],
          set: { status: item.status, note: item.note || null },
        })
    }
  } catch {
    return { ok: false, error: { code: "DB_ERROR", message: "Não foi possível salvar o laudo de inspeção." } }
  }

  revalidatePath(`/admin/cars/${carId}`)
  return { ok: true, data: null }
}
