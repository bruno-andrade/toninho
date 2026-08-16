"use server"

import type { ActionResult } from "@/lib/actions/action-result"

export type UpdateSiteSettingsState = ActionResult<void> | null

export async function updateSiteSettingsAction(
  _prevState: UpdateSiteSettingsState,
  formData: FormData
): Promise<UpdateSiteSettingsState> {
  const get = (key: string) => String(formData.get(key) ?? "").trim()

  const storeName = get("storeName")
  const whatsappNumber = get("whatsappNumber")
  const addressStreet = get("addressStreet")
  const city = get("city")
  const state = get("state")
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

  return {
    ok: false,
    error: {
      code: "NOT_IMPLEMENTED",
      message:
        "Configurações ainda não estão conectadas ao banco de dados. Próxima etapa: tabela site_settings (ver docs/DATA_MODEL.md).",
    },
  }
}
