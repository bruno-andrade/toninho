"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { setCarStatusAction } from "./[carId]/actions"

const OPTIONS = [
  { value: "available", label: "Disponível" },
  { value: "reserved", label: "Reservado" },
  { value: "sold", label: "Vendido" },
] as const

export function QuickStatusSelect({ carId, status }: { carId: string; status: (typeof OPTIONS)[number]["value"] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <select
      value={status}
      disabled={isPending}
      data-testid="quick-status-select"
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => {
        event.stopPropagation()
        const next = event.target.value as (typeof OPTIONS)[number]["value"]
        startTransition(async () => {
          await setCarStatusAction(carId, next)
          router.refresh()
        })
      }}
      className="rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-neutral-300 disabled:opacity-60"
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
