"use server"

import { headers } from "next/headers"
import type { ActionResult } from "@/lib/actions/action-result"
import { getDb } from "@/lib/db/client"
import { sellerSubmissionPhotos, sellerSubmissions } from "@/lib/db/schema"
import { isRateLimited } from "@/lib/site/rate-limit"

export type SubmitSellRequestState = ActionResult<{ submissionId: string }> | null

const TRANSMISSIONS = ["manual", "automatic"] as const
const CURRENT_YEAR = new Date().getFullYear()

export async function submitSellRequestAction(
  _prevState: SubmitSellRequestState,
  formData: FormData
): Promise<SubmitSellRequestState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (isRateLimited(`sell-request:${ip}`, 3, 60 * 60_000)) {
    return {
      ok: false,
      error: { code: "RATE_LIMITED", message: "Muitas solicitações enviadas. Tente novamente mais tarde." },
    }
  }

  const get = (key: string) => String(formData.get(key) ?? "").trim()

  const brand = get("brand")
  const model = get("model")
  const year = Number(get("year"))
  const km = Number(get("km"))
  const transmission = get("transmission")
  const color = get("color")
  const conditionNotes = get("conditionNotes")
  const sellerName = get("sellerName")
  const sellerPhone = get("sellerPhone")
  const sellerCity = get("sellerCity")
  const photoUrls = formData.getAll("photoUrls").map(String).filter(Boolean)

  const fieldErrors: Record<string, string[]> = {}
  if (!brand) fieldErrors.brand = ["Informe a marca."]
  if (!model) fieldErrors.model = ["Informe o modelo."]
  if (!Number.isInteger(year) || year < 1990 || year > CURRENT_YEAR + 1) {
    fieldErrors.year = ["Informe um ano válido."]
  }
  if (!Number.isFinite(km) || km < 0) fieldErrors.km = ["Informe uma quilometragem válida."]
  if (!sellerName) fieldErrors.sellerName = ["Informe seu nome."]
  if (!/^\d{10,13}$/.test(sellerPhone.replace(/\D/g, ""))) {
    fieldErrors.sellerPhone = ["Informe um telefone válido, com DDD."]
  }
  if (photoUrls.length === 0) fieldErrors.photos = ["Envie pelo menos 1 foto do carro."]

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "Revise os campos destacados.", fieldErrors } }
  }

  try {
    const db = getDb()
    const [row] = await db
      .insert(sellerSubmissions)
      .values({
        brand,
        model,
        year,
        km,
        transmission: TRANSMISSIONS.includes(transmission as (typeof TRANSMISSIONS)[number])
          ? (transmission as (typeof TRANSMISSIONS)[number])
          : null,
        color: color || null,
        conditionNotes: conditionNotes || null,
        sellerName,
        sellerPhone: sellerPhone.replace(/\D/g, ""),
        sellerCity: sellerCity || null,
      })
      .returning({ id: sellerSubmissions.id })

    await db
      .insert(sellerSubmissionPhotos)
      .values(photoUrls.map((url, index) => ({ submissionId: row.id, url, position: index })))

    return { ok: true, data: { submissionId: row.id } }
  } catch {
    return {
      ok: false,
      error: { code: "DB_ERROR", message: "Não foi possível enviar sua solicitação. Tente novamente." },
    }
  }
}
