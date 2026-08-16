"use client"

import { useState, useTransition } from "react"
import { updateInspectionItemsAction, type InspectionItemInput } from "./inspection-actions"

const CATEGORIES = [
  { value: "motor_cambio", label: "Motor e câmbio" },
  { value: "estrutura_lataria", label: "Estrutura/lataria" },
  { value: "pintura", label: "Pintura" },
  { value: "pneus_rodas", label: "Pneus e rodas" },
  { value: "eletrica", label: "Itens elétricos" },
  { value: "documentacao", label: "Documentação" },
] as const

const STATUSES = [
  { value: "aprovado", label: "Aprovado" },
  { value: "reparo_leve", label: "Reparo leve" },
  { value: "atencao", label: "Atenção" },
] as const

type ExistingItem = { category: string; status: string; note: string | null }
type RowValue = { status: (typeof STATUSES)[number]["value"]; note: string }

export function InspectionForm({ carId, existingItems }: { carId: string; existingItems: ExistingItem[] }) {
  const existingMap = new Map(existingItems.map((item) => [item.category, item]))
  const [values, setValues] = useState<Record<string, RowValue>>(() =>
    Object.fromEntries(
      CATEGORIES.map((category) => [
        category.value,
        {
          status: (existingMap.get(category.value)?.status as RowValue["status"]) ?? "aprovado",
          note: existingMap.get(category.value)?.note ?? "",
        },
      ])
    )
  )
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function updateRow(category: string, patch: Partial<RowValue>) {
    setValues((prev) => ({ ...prev, [category]: { ...prev[category], ...patch } }))
  }

  function submit() {
    setError(null)
    setMessage(null)
    const items: InspectionItemInput[] = CATEGORIES.map((category) => ({
      category: category.value,
      status: values[category.value].status,
      note: values[category.value].note || undefined,
    }))
    startTransition(async () => {
      const result = await updateInspectionItemsAction(carId, items)
      if (!result.ok) setError(result.error.message)
      else setMessage("Laudo salvo.")
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {message ? (
        <p className="rounded-lg border border-emerald-800 bg-emerald-950 px-4 py-3 text-sm text-emerald-300">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-lg border border-amber-800 bg-amber-950 px-4 py-3 text-sm text-amber-300">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CATEGORIES.map((category) => (
          <div
            key={category.value}
            data-testid={`inspection-${category.value}`}
            className="flex flex-col gap-2 rounded-lg border border-neutral-800 p-3"
          >
            <span className="text-sm font-semibold text-white">{category.label}</span>
            <select
              value={values[category.value].status}
              onChange={(event) => updateRow(category.value, { status: event.target.value as RowValue["status"] })}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
            >
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <input
              placeholder="Observação (opcional)"
              value={values[category.value].note}
              onChange={(event) => updateRow(category.value, { note: event.target.value })}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={isPending}
        onClick={submit}
        className="self-start rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Salvando…" : "Salvar laudo"}
      </button>
    </div>
  )
}
