"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/actions/action-result"
import { getDb } from "@/lib/db/client"
import { cars, sellerSubmissions } from "@/lib/db/schema"
import { buildCarSlug } from "@/lib/db/slug"

const STATUSES = ["novo", "em_analise", "proposta_enviada", "recusado", "comprado"] as const

export async function updateSellRequestStatusAction(
  submissionId: string,
  status: (typeof STATUSES)[number],
  internalNotes: string
): Promise<ActionResult<null>> {
  if (!STATUSES.includes(status)) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "Status inválido." } }
  }

  try {
    await getDb()
      .update(sellerSubmissions)
      .set({ status, internalNotes: internalNotes || null, updatedAt: new Date() })
      .where(eq(sellerSubmissions.id, submissionId))
  } catch {
    return { ok: false, error: { code: "DB_ERROR", message: "Não foi possível salvar a solicitação." } }
  }

  revalidatePath(`/admin/sell-requests/${submissionId}`)
  revalidatePath("/admin/sell-requests")
  return { ok: true, data: null }
}

export async function createCarFromSellRequestAction(submissionId: string): Promise<ActionResult<{ carId: string }>> {
  const db = getDb()
  const [submission] = await db.select().from(sellerSubmissions).where(eq(sellerSubmissions.id, submissionId)).limit(1)
  if (!submission) {
    return { ok: false, error: { code: "NOT_FOUND", message: "Solicitação não encontrada." } }
  }
  if (submission.status !== "comprado") {
    return {
      ok: false,
      error: { code: "INVALID_TRANSITION", message: "Marque a solicitação como 'comprado' antes de criar o anúncio." },
    }
  }

  const slug = buildCarSlug(submission.brand, submission.model, submission.year)

  try {
    const [row] = await db
      .insert(cars)
      .values({
        slug,
        brand: submission.brand,
        model: submission.model,
        bodyType: "sedan",
        yearFab: submission.year,
        yearModel: submission.year,
        km: submission.km,
        transmission: submission.transmission ?? "manual",
        fuel: "flex",
        color: submission.color ?? "A definir",
        armored: false,
        hasSpareKey: true,
        origin: "particular",
        price: "0",
        city: submission.sellerCity ?? "Maceió",
        state: "AL",
      })
      .returning({ id: cars.id })

    revalidatePath("/admin/cars")
    return { ok: true, data: { carId: row.id } }
  } catch {
    return { ok: false, error: { code: "DB_ERROR", message: "Não foi possível criar o anúncio." } }
  }
}
