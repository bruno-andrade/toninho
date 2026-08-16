"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/actions/action-result"
import { getDb } from "@/lib/db/client"
import { cars } from "@/lib/db/schema"
import { buildCarSlug } from "@/lib/db/slug"

export type CreateCarActionState = ActionResult<{ carId: string }> | null

const CURRENT_YEAR = new Date().getFullYear()

const BODY_TYPES = ["hatch", "sedan", "suv", "pickup", "wagon"] as const
const TRANSMISSIONS = ["manual", "automatic"] as const
const FUELS = ["flex", "gasolina", "diesel", "eletrico", "hibrido"] as const
const ORIGINS = ["particular", "leilao"] as const

export async function createCarAction(
  _prevState: CreateCarActionState,
  formData: FormData
): Promise<CreateCarActionState> {
  const get = (key: string) => String(formData.get(key) ?? "").trim()

  const brand = get("brand")
  const model = get("model")
  const bodyType = get("bodyType")
  const origin = get("origin")
  const transmission = get("transmission")
  const fuel = get("fuel")
  const yearFab = Number(get("yearFab"))
  const yearModel = Number(get("yearModel"))
  const km = Number(get("km"))
  const priceRaw = get("price").replace(",", ".")
  const price = Number(priceRaw)
  const marketValueRaw = get("marketValue").replace(",", ".")
  const city = get("city")
  const state = get("state").toUpperCase()
  const color = get("color")

  const fieldErrors: Record<string, string[]> = {}
  if (!brand) fieldErrors.brand = ["Informe a marca."]
  if (!model) fieldErrors.model = ["Informe o modelo."]
  if (!color) fieldErrors.color = ["Informe a cor."]
  if (!(BODY_TYPES as readonly string[]).includes(bodyType)) fieldErrors.bodyType = ["Selecione uma carroceria."]
  if (!(TRANSMISSIONS as readonly string[]).includes(transmission)) fieldErrors.transmission = ["Selecione o câmbio."]
  if (!(FUELS as readonly string[]).includes(fuel)) fieldErrors.fuel = ["Selecione o combustível."]
  if (!(ORIGINS as readonly string[]).includes(origin)) fieldErrors.origin = ["Selecione a origem."]
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

  const slug = buildCarSlug(brand, model, yearModel)
  let carId: string

  try {
    const [row] = await getDb()
      .insert(cars)
      .values({
        slug,
        brand,
        model,
        bodyType: bodyType as (typeof BODY_TYPES)[number],
        yearFab,
        yearModel,
        km,
        transmission: transmission as (typeof TRANSMISSIONS)[number],
        fuel: fuel as (typeof FUELS)[number],
        color,
        armored: formData.get("armored") === "on",
        hasSpareKey: formData.get("hasSpareKey") === "on",
        origin: origin as (typeof ORIGINS)[number],
        price: priceRaw,
        marketValue: marketValueRaw || null,
        city,
        state,
        featured: formData.get("featured") === "on",
      })
      .returning({ id: cars.id })
    carId = row.id
  } catch {
    return {
      ok: false,
      error: { code: "DB_ERROR", message: "Não foi possível salvar o carro. Tente novamente." },
    }
  }

  revalidatePath("/admin/cars")
  redirect(`/admin/cars/${carId}`)
}
