"use server"

import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/actions/action-result"
import { getDb } from "@/lib/db/client"
import { siteSettings } from "@/lib/db/schema"

export type UpdateSiteSettingsState = ActionResult<null> | null

export async function updateSiteSettingsAction(
  _prevState: UpdateSiteSettingsState,
  formData: FormData
): Promise<UpdateSiteSettingsState> {
  const get = (key: string) => String(formData.get(key) ?? "").trim()

  const storeName = get("storeName")
  const whatsappNumber = get("whatsappNumber")
  const addressStreet = get("addressStreet")
  const addressNeighborhood = get("addressNeighborhood")
  const city = get("city")
  const state = get("state").toUpperCase()
  const zipCode = get("zipCode")

  const fieldErrors: Record<string, string[]> = {}
  if (!storeName) fieldErrors.storeName = ["Informe o nome da loja."]
  if (!/^\d{12,13}$/.test(whatsappNumber)) {
    fieldErrors.whatsappNumber = ["Use o formato internacional, só dígitos (ex: 5582999999999)."]
  }
  if (!addressStreet) fieldErrors.addressStreet = ["Informe o endereço."]
  if (!city) fieldErrors.city = ["Informe a cidade."]
  if (!/^[A-Za-z]{2}$/.test(state)) fieldErrors.state = ["Informe a UF (2 letras)."]
  if (!/^\d{5}-?\d{3}$/.test(zipCode)) fieldErrors.zipCode = ["Informe um CEP válido."]

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "Revise os campos destacados.", fieldErrors } }
  }

  const values = {
    id: 1,
    storeName,
    whatsappNumber,
    addressStreet,
    addressNeighborhood: addressNeighborhood || null,
    city,
    state,
    zipCode,
  }

  try {
    await getDb()
      .insert(siteSettings)
      .values(values)
      .onConflictDoUpdate({ target: siteSettings.id, set: values })
  } catch {
    return {
      ok: false,
      error: { code: "DB_ERROR", message: "Não foi possível salvar as configurações. Tente novamente." },
    }
  }

  revalidatePath("/admin/settings")
  return { ok: true, data: null }
}
