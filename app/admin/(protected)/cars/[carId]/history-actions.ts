"use server"

import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/actions/action-result"
import { getDb } from "@/lib/db/client"
import { carHistory } from "@/lib/db/schema"

export type UpdateCarHistoryState = ActionResult<null> | null

export async function updateCarHistoryAction(
  _prevState: UpdateCarHistoryState,
  formData: FormData
): Promise<UpdateCarHistoryState> {
  const carId = String(formData.get("carId") ?? "")
  const previousOwnersCount = Number(formData.get("previousOwnersCount"))
  const hadAccidentRecord = formData.get("hadAccidentRecord") === "on"
  const dealerServicedUntilYearRaw = String(formData.get("dealerServicedUntilYear") ?? "").trim()
  const inspectedByTeam = formData.get("inspectedByTeam") === "on"
  const additionalNotes = String(formData.get("additionalNotes") ?? "").trim()

  const fieldErrors: Record<string, string[]> = {}
  if (!carId) fieldErrors.carId = ["Carro inválido."]
  if (!Number.isInteger(previousOwnersCount) || previousOwnersCount < 0) {
    fieldErrors.previousOwnersCount = ["Informe um número válido de donos anteriores."]
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "Revise os campos destacados.", fieldErrors } }
  }

  const values = {
    carId,
    previousOwnersCount,
    hadAccidentRecord,
    dealerServicedUntilYear: dealerServicedUntilYearRaw ? Number(dealerServicedUntilYearRaw) : null,
    inspectedByTeam,
    additionalNotes: additionalNotes || null,
  }

  try {
    await getDb().insert(carHistory).values(values).onConflictDoUpdate({ target: carHistory.carId, set: values })
  } catch {
    return { ok: false, error: { code: "DB_ERROR", message: "Não foi possível salvar o histórico." } }
  }

  revalidatePath(`/admin/cars/${carId}`)
  return { ok: true, data: null }
}
