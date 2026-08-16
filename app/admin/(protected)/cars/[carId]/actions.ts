"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/actions/action-result"
import { getDb } from "@/lib/db/client"
import { carPhotos, cars } from "@/lib/db/schema"

export type UpdateCarBasicsState = ActionResult<null> | null

const CURRENT_YEAR = new Date().getFullYear()

const BODY_TYPES = ["hatch", "sedan", "suv", "pickup", "wagon"] as const
const TRANSMISSIONS = ["manual", "automatic"] as const
const FUELS = ["flex", "gasolina", "diesel", "eletrico", "hibrido"] as const
const ORIGINS = ["particular", "leilao"] as const

export async function updateCarBasicsAction(
  _prevState: UpdateCarBasicsState,
  formData: FormData
): Promise<UpdateCarBasicsState> {
  const carId = String(formData.get("carId") ?? "")
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
  if (!carId) fieldErrors.carId = ["Carro inválido."]
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

  try {
    await getDb()
      .update(cars)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(cars.id, carId))
  } catch {
    return {
      ok: false,
      error: { code: "DB_ERROR", message: "Não foi possível salvar as alterações. Tente novamente." },
    }
  }

  revalidatePath(`/admin/cars/${carId}`)
  revalidatePath("/admin/cars")
  revalidatePath("/")
  revalidatePath("/busca")
  return { ok: true, data: null }
}

export async function publishCarAction(carId: string): Promise<ActionResult<null>> {
  const db = getDb()

  const [car] = await db.select({ status: cars.status, price: cars.price }).from(cars).where(eq(cars.id, carId)).limit(1)
  if (!car) {
    return { ok: false, error: { code: "NOT_FOUND", message: "Carro não encontrado." } }
  }
  if (car.status !== "draft") {
    return { ok: false, error: { code: "INVALID_TRANSITION", message: "Este carro já foi publicado." } }
  }
  if (!(Number(car.price) > 0)) {
    return { ok: false, error: { code: "MISSING_PRICE", message: "Defina um preço antes de publicar." } }
  }

  const [cover] = await db
    .select({ id: carPhotos.id })
    .from(carPhotos)
    .where(and(eq(carPhotos.carId, carId), eq(carPhotos.isCover, true)))
    .limit(1)
  if (!cover) {
    return {
      ok: false,
      error: { code: "MISSING_COVER_PHOTO", message: "Adicione ao menos uma foto de capa antes de publicar." },
    }
  }

  try {
    await db.update(cars).set({ status: "available", updatedAt: new Date() }).where(eq(cars.id, carId))
  } catch {
    return { ok: false, error: { code: "DB_ERROR", message: "Não foi possível publicar o carro." } }
  }

  revalidatePath(`/admin/cars/${carId}`)
  revalidatePath("/admin/cars")
  revalidatePath("/")
  revalidatePath("/busca")
  return { ok: true, data: null }
}

const SETTABLE_STATUSES = ["available", "reserved", "sold"] as const

export async function setCarStatusAction(
  carId: string,
  status: (typeof SETTABLE_STATUSES)[number]
): Promise<ActionResult<null>> {
  if (!SETTABLE_STATUSES.includes(status)) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "Status inválido." } }
  }

  const db = getDb()
  const [car] = await db
    .select({ status: cars.status, archived: cars.archived })
    .from(cars)
    .where(eq(cars.id, carId))
    .limit(1)
  if (!car) {
    return { ok: false, error: { code: "NOT_FOUND", message: "Carro não encontrado." } }
  }
  if (car.status === "draft" || car.archived) {
    return {
      ok: false,
      error: { code: "INVALID_TRANSITION", message: "Publique o carro antes de alterar o status." },
    }
  }

  try {
    await db
      .update(cars)
      .set({
        status,
        soldAt: status === "sold" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(cars.id, carId))
  } catch {
    return { ok: false, error: { code: "DB_ERROR", message: "Não foi possível atualizar o status." } }
  }

  revalidatePath(`/admin/cars/${carId}`)
  revalidatePath("/admin/cars")
  revalidatePath("/")
  revalidatePath("/busca")
  return { ok: true, data: null }
}

export async function archiveCarAction(carId: string, archived: boolean): Promise<ActionResult<null>> {
  const db = getDb()

  try {
    await db.update(cars).set({ archived, updatedAt: new Date() }).where(eq(cars.id, carId))
  } catch {
    return { ok: false, error: { code: "DB_ERROR", message: "Não foi possível atualizar o carro." } }
  }

  revalidatePath(`/admin/cars/${carId}`)
  revalidatePath("/admin/cars")
  revalidatePath("/")
  revalidatePath("/busca")
  return { ok: true, data: null }
}
