"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { createCarFromSellRequestAction, updateSellRequestStatusAction } from "./actions"

const STATUSES = [
  { value: "novo", label: "Novo" },
  { value: "em_analise", label: "Em análise" },
  { value: "proposta_enviada", label: "Proposta enviada" },
  { value: "recusado", label: "Recusado" },
  { value: "comprado", label: "Comprado" },
] as const

type Status = (typeof STATUSES)[number]["value"]

export function StatusForm({
  submissionId,
  status: initialStatus,
  internalNotes: initialNotes,
}: {
  submissionId: string
  status: Status
  internalNotes: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>(initialStatus)
  const [internalNotes, setInternalNotes] = useState(initialNotes)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function save() {
    setMessage(null)
    setError(null)
    startTransition(async () => {
      const result = await updateSellRequestStatusAction(submissionId, status, internalNotes)
      if (!result.ok) setError(result.error.message)
      else {
        setMessage("Salvo.")
        router.refresh()
      }
    })
  }

  function createCar() {
    setError(null)
    startTransition(async () => {
      const result = await createCarFromSellRequestAction(submissionId)
      if (!result.ok) setError(result.error.message)
      else router.push(`/admin/cars/${result.data.carId}`)
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-800 p-5">
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {error ? (
        <p role="alert" className="text-sm text-amber-300">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-300">Status</label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as Status)}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
        >
          {STATUSES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-300">Notas internas</label>
        <textarea
          value={internalNotes}
          onChange={(event) => setInternalNotes(event.target.value)}
          rows={3}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={save}
          className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Salvando…" : "Salvar"}
        </button>
        {status === "comprado" ? (
          <button
            type="button"
            disabled={isPending}
            onClick={createCar}
            className="rounded-lg border border-neutral-700 px-5 py-2.5 text-sm font-semibold text-neutral-200 transition hover:border-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Criar anúncio a partir desta solicitação
          </button>
        ) : null}
      </div>
    </div>
  )
}
