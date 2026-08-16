"use client"

import { useActionState } from "react"
import { Field } from "@/components/admin/form-field"
import { updateCarHistoryAction, type UpdateCarHistoryState } from "./history-actions"

const initialState: UpdateCarHistoryState = null

type ExistingHistory = {
  previousOwnersCount: number
  hadAccidentRecord: boolean
  dealerServicedUntilYear: number | null
  inspectedByTeam: boolean
  additionalNotes: string | null
}

function fieldError(state: UpdateCarHistoryState, field: string) {
  if (!state || state.ok) return undefined
  return state.error.fieldErrors?.[field]?.[0]
}

export function HistoryForm({ carId, existing }: { carId: string; existing: ExistingHistory | null }) {
  const [state, formAction, pending] = useActionState(updateCarHistoryAction, initialState)

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <input type="hidden" name="carId" value={carId} />

      {state?.ok ? (
        <p className="rounded-lg border border-emerald-800 bg-emerald-950 px-4 py-3 text-sm text-emerald-300">
          Histórico salvo.
        </p>
      ) : null}
      {state && !state.ok && state.error.code !== "VALIDATION_ERROR" ? (
        <p role="alert" className="rounded-lg border border-amber-800 bg-amber-950 px-4 py-3 text-sm text-amber-300">
          {state.error.message}
        </p>
      ) : null}

      <Field
        label="Número de donos anteriores"
        name="previousOwnersCount"
        type="number"
        defaultValue={String(existing?.previousOwnersCount ?? 1)}
        error={fieldError(state, "previousOwnersCount")}
      />

      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          name="hadAccidentRecord"
          defaultChecked={existing?.hadAccidentRecord ?? false}
          className="h-4 w-4 rounded border-neutral-700 bg-neutral-800"
        />
        Possui registro de sinistro
      </label>

      <Field
        label="Revisado em concessionária até (ano, opcional)"
        name="dealerServicedUntilYear"
        type="number"
        required={false}
        defaultValue={existing?.dealerServicedUntilYear ? String(existing.dealerServicedUntilYear) : ""}
      />

      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          name="inspectedByTeam"
          defaultChecked={existing?.inspectedByTeam ?? true}
          className="h-4 w-4 rounded border-neutral-700 bg-neutral-800"
        />
        Revisado pela equipe AuToninho
      </label>

      <Field
        label="Observações adicionais (opcional)"
        name="additionalNotes"
        required={false}
        defaultValue={existing?.additionalNotes ?? ""}
      />

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar histórico"}
      </button>
    </form>
  )
}
