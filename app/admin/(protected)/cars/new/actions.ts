"use server"

import type { ActionResult } from "@/lib/actions/action-result"

export type CreateCarActionState = ActionResult<{ carId: string }> | null

const CURRENT_YEAR = new Date().getFullYear()

export async function createCarAction(
  _prevState: CreateCarActionState,
  formData: FormData
): Promise<CreateCarActionState> {
  const get = (key: string) => String(formData.get(key) ?? "").trim()

  const brand = get("brand")
  const model = get("model")
  const yearFab = Number(get("yearFab"))
  const yearModel = Number(get("yearModel"))
  const km = Number(get("km"))
  const priceRaw = get("price").replace(",", ".")
  const price = Number(priceRaw)
  const city = get("city")
  const state = get("state")

  const fieldErrors: Record<string, string[]> = {}
  if (!brand) fieldErrors.brand = ["Informe a marca."]
  if (!model) fieldErrors.model = ["Informe o modelo."]
  if (!Number.isInteger(yearFab) || yearFab < 1990 || yearFab > CURRENT_YEAR + 1) {
    fieldErrors.yearFab = ["Informe um ano de fabricação válido."]
  }
  if (!Number.isInteger(yearModel) || yearModel < 1990 || yearModel > CURRENT_YEAR + 1) {
    fieldErrors.yearModel = ["Informe um ano de modelo válido."]
  }
  if (!Number.isFinite(km) || km < 0) fieldErrors.km = ["Informe uma quilometragem válida."]
  if (!priceRaw || !Number.isFinite(price) || price <= 0) fieldErrors.price = ["Informe um preço válido."]
  if (!city) fieldErrors.city = ["Informe a cidade."]
  if (!/^[A-Za-z]{2}$/.test(state)) fieldErrors.state = ["Informe a UF (2 letras)."]

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Revise os campos destacados.", fieldErrors },
    }
  }

  return {
    ok: false,
    error: {
      code: "NOT_IMPLEMENTED",
      message:
        "Cadastro ainda não está conectado ao banco de dados. Próxima etapa: provisionar Postgres e implementar createCarAction conforme docs/ADMIN_SERVER_ACTIONS.md.",
    },
  }
}
