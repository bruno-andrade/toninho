"use client"

import { useActionState } from "react"
import { Field, SelectField } from "@/components/admin/form-field"
import type { cars } from "@/lib/db/schema"
import { updateCarBasicsAction, type UpdateCarBasicsState } from "./actions"

const initialState: UpdateCarBasicsState = null

const BODY_TYPES = [
  { value: "hatch", label: "Hatch" },
  { value: "sedan", label: "Sedã" },
  { value: "suv", label: "SUV" },
  { value: "pickup", label: "Picape" },
  { value: "wagon", label: "Perua" },
] as const

const TRANSMISSIONS = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automático" },
] as const

const FUELS = [
  { value: "flex", label: "Flex" },
  { value: "gasolina", label: "Gasolina" },
  { value: "diesel", label: "Diesel" },
  { value: "eletrico", label: "Elétrico" },
  { value: "hibrido", label: "Híbrido" },
] as const

const ORIGINS = [
  { value: "particular", label: "Particular" },
  { value: "leilao", label: "Leilão" },
] as const

function fieldError(state: UpdateCarBasicsState, field: string) {
  if (!state || state.ok) return undefined
  return state.error.fieldErrors?.[field]?.[0]
}

export function EditCarForm({ car }: { car: typeof cars.$inferSelect }) {
  const [state, formAction, pending] = useActionState(updateCarBasicsAction, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="carId" value={car.id} />

      {state?.ok ? (
        <p className="rounded-lg border border-emerald-800 bg-emerald-950 px-4 py-3 text-sm text-emerald-300">
          Alterações salvas.
        </p>
      ) : null}
      {state && !state.ok && state.error.code !== "VALIDATION_ERROR" ? (
        <p role="alert" className="rounded-lg border border-amber-800 bg-amber-950 px-4 py-3 text-sm text-amber-300">
          {state.error.message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Marca" name="brand" defaultValue={car.brand} error={fieldError(state, "brand")} />
        <Field label="Modelo" name="model" defaultValue={car.model} error={fieldError(state, "model")} />

        <SelectField label="Carroceria" name="bodyType" options={BODY_TYPES} defaultValue={car.bodyType} />
        <SelectField label="Origem" name="origin" options={ORIGINS} defaultValue={car.origin} />

        <Field
          label="Ano de fabricação"
          name="yearFab"
          type="number"
          defaultValue={String(car.yearFab)}
          error={fieldError(state, "yearFab")}
        />
        <Field
          label="Ano do modelo"
          name="yearModel"
          type="number"
          defaultValue={String(car.yearModel)}
          error={fieldError(state, "yearModel")}
        />

        <Field
          label="Quilometragem"
          name="km"
          type="number"
          defaultValue={String(car.km)}
          error={fieldError(state, "km")}
        />
        <Field label="Cor" name="color" defaultValue={car.color} error={fieldError(state, "color")} />

        <SelectField label="Câmbio" name="transmission" options={TRANSMISSIONS} defaultValue={car.transmission} />
        <SelectField label="Combustível" name="fuel" options={FUELS} defaultValue={car.fuel} />

        <Field label="Preço (R$)" name="price" defaultValue={car.price} error={fieldError(state, "price")} />
        <Field label="Valor de mercado (R$, opcional)" name="marketValue" required={false} defaultValue={car.marketValue ?? ""} />

        <Field label="Cidade" name="city" defaultValue={car.city} error={fieldError(state, "city")} />
        <Field
          label="UF"
          name="state"
          maxLength={2}
          defaultValue={car.state}
          error={fieldError(state, "state")}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          name="armored"
          defaultChecked={car.armored}
          className="h-4 w-4 rounded border-neutral-700 bg-neutral-800"
        />
        Blindado
      </label>
      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          name="hasSpareKey"
          defaultChecked={car.hasSpareKey}
          className="h-4 w-4 rounded border-neutral-700 bg-neutral-800"
        />
        Possui chave reserva
      </label>
      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={car.featured}
          className="h-4 w-4 rounded border-neutral-700 bg-neutral-800"
        />
        Destacar na Home
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  )
}
