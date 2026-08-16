"use client"

import { useActionState } from "react"
import { Field, SelectField } from "@/components/admin/form-field"
import { createCarAction, type CreateCarActionState } from "./actions"

const initialState: CreateCarActionState = null

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

function fieldError(state: CreateCarActionState, field: string) {
  if (!state || state.ok) return undefined
  return state.error.fieldErrors?.[field]?.[0]
}

export function CarForm() {
  const [state, formAction, pending] = useActionState(createCarAction, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state && !state.ok && state.error.code !== "VALIDATION_ERROR" ? (
        <p role="alert" className="rounded-lg border border-amber-800 bg-amber-950 px-4 py-3 text-sm text-amber-300">
          {state.error.message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Marca" name="brand" error={fieldError(state, "brand")} />
        <Field label="Modelo" name="model" error={fieldError(state, "model")} />

        <SelectField label="Carroceria" name="bodyType" options={BODY_TYPES} />
        <SelectField label="Origem" name="origin" options={ORIGINS} />

        <Field label="Ano de fabricação" name="yearFab" type="number" error={fieldError(state, "yearFab")} />
        <Field label="Ano do modelo" name="yearModel" type="number" error={fieldError(state, "yearModel")} />

        <Field label="Quilometragem" name="km" type="number" error={fieldError(state, "km")} />
        <Field label="Cor" name="color" />

        <SelectField label="Câmbio" name="transmission" options={TRANSMISSIONS} />
        <SelectField label="Combustível" name="fuel" options={FUELS} />

        <Field label="Preço (R$)" name="price" error={fieldError(state, "price")} />
        <Field label="Valor de mercado (R$, opcional)" name="marketValue" required={false} />

        <Field label="Cidade" name="city" error={fieldError(state, "city")} />
        <Field label="UF" name="state" maxLength={2} error={fieldError(state, "state")} />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input type="checkbox" name="armored" className="h-4 w-4 rounded border-neutral-700 bg-neutral-800" />
        Blindado
      </label>
      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          name="hasSpareKey"
          defaultChecked
          className="h-4 w-4 rounded border-neutral-700 bg-neutral-800"
        />
        Possui chave reserva
      </label>
      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input type="checkbox" name="featured" className="h-4 w-4 rounded border-neutral-700 bg-neutral-800" />
        Destacar na Home
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar e continuar"}
      </button>
    </form>
  )
}
