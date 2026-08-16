"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { carHistory, carInspectionItems, carPhotos, cars } from "@/lib/db/schema"
import { archiveCarAction, publishCarAction, setCarStatusAction } from "./actions"
import { EditCarForm } from "./edit-car-form"
import { HistoryForm } from "./history-form"
import { InspectionForm } from "./inspection-form"
import { PhotoManager } from "./photo-manager"

const TABS = ["Dados básicos", "Fotos", "Laudo de inspeção", "Histórico"] as const

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  available: "Disponível",
  reserved: "Reservado",
  sold: "Vendido",
}

const SETTABLE_STATUSES = [
  { value: "available", label: "Disponível" },
  { value: "reserved", label: "Reservado" },
  { value: "sold", label: "Vendido" },
] as const

export function CarEditTabs({
  car,
  photos,
  inspectionItems,
  history,
}: {
  car: typeof cars.$inferSelect
  photos: (typeof carPhotos.$inferSelect)[]
  inspectionItems: (typeof carInspectionItems.$inferSelect)[]
  history: typeof carHistory.$inferSelect | null
}) {
  const router = useRouter()
  const [active, setActive] = useState<(typeof TABS)[number]>("Dados básicos")
  const [statusError, setStatusError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function publish() {
    setStatusError(null)
    startTransition(async () => {
      const result = await publishCarAction(car.id)
      if (!result.ok) setStatusError(result.error.message)
      else router.refresh()
    })
  }

  function changeStatus(status: (typeof SETTABLE_STATUSES)[number]["value"]) {
    setStatusError(null)
    startTransition(async () => {
      const result = await setCarStatusAction(car.id, status)
      if (!result.ok) setStatusError(result.error.message)
      else router.refresh()
    })
  }

  function toggleArchived(archived: boolean) {
    if (archived && !window.confirm("Remover este carro da vitrine? O histórico é mantido, você pode restaurar depois.")) {
      return
    }
    setStatusError(null)
    startTransition(async () => {
      const result = await archiveCarAction(car.id, archived)
      if (!result.ok) setStatusError(result.error.message)
      else router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-fit rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-300">
            {STATUS_LABEL[car.status]}
          </span>
          {car.archived ? (
            <span className="w-fit rounded-full bg-red-950 px-3 py-1 text-xs font-semibold text-red-300">
              Arquivado
            </span>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            {car.status === "draft" ? (
              <button
                type="button"
                disabled={isPending}
                onClick={publish}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Publicando…" : "Publicar carro"}
              </button>
            ) : null}

            {car.status !== "draft" && !car.archived ? (
              <select
                value={car.status}
                disabled={isPending}
                onChange={(event) => changeStatus(event.target.value as (typeof SETTABLE_STATUSES)[number]["value"])}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
              >
                {SETTABLE_STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}

            {car.status !== "draft" ? (
              <button
                type="button"
                disabled={isPending}
                onClick={() => toggleArchived(!car.archived)}
                className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:border-red-800 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {car.archived ? "Restaurar" : "Remover da vitrine"}
              </button>
            ) : null}
          </div>
          {statusError ? <p className="text-xs text-red-400">{statusError}</p> : null}
        </div>
      </div>

      <div className="flex gap-2 border-b border-neutral-800">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`px-4 py-2 text-sm font-medium transition ${
              active === tab ? "border-b-2 border-orange-500 text-white" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === "Dados básicos" ? <EditCarForm car={car} /> : null}
      {active === "Fotos" ? <PhotoManager carId={car.id} photos={photos} /> : null}
      {active === "Laudo de inspeção" ? <InspectionForm carId={car.id} existingItems={inspectionItems} /> : null}
      {active === "Histórico" ? <HistoryForm carId={car.id} existing={history} /> : null}
    </div>
  )
}
