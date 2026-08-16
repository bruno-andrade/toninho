"use client"

import { useActionState } from "react"
import { Field } from "@/components/admin/form-field"
import { updateSiteSettingsAction, type UpdateSiteSettingsState } from "./actions"

const initialState: UpdateSiteSettingsState = null

function fieldError(state: UpdateSiteSettingsState, field: string) {
  if (!state || state.ok) return undefined
  return state.error.fieldErrors?.[field]?.[0]
}

export function SettingsForm() {
  const [state, formAction, pending] = useActionState(updateSiteSettingsAction, initialState)

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      {state && !state.ok && state.error.code !== "VALIDATION_ERROR" ? (
        <p role="alert" className="rounded-lg border border-amber-800 bg-amber-950 px-4 py-3 text-sm text-amber-300">
          {state.error.message}
        </p>
      ) : null}

      <Field label="Nome da loja" name="storeName" error={fieldError(state, "storeName")} />
      <Field
        label="WhatsApp (com DDI e DDD, só números)"
        name="whatsappNumber"
        error={fieldError(state, "whatsappNumber")}
      />
      <Field label="Endereço" name="addressStreet" error={fieldError(state, "addressStreet")} />
      <Field label="Bairro" name="addressNeighborhood" required={false} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Cidade" name="city" error={fieldError(state, "city")} />
        <Field label="UF" name="state" maxLength={2} error={fieldError(state, "state")} />
      </div>
      <Field label="CEP" name="zipCode" error={fieldError(state, "zipCode")} />

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar configurações"}
      </button>
    </form>
  )
}
