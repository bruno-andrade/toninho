"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { carPhotos, cars } from "@/lib/db/schema"
import { publishCarAction } from "./actions"
import { EditCarForm } from "./edit-car-form"
import { PhotoManager } from "./photo-manager"

const TABS = ["Dados básicos", "Fotos", "Laudo de inspeção", "Histórico"] as const

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  available: "Disponível",
  reserved: "Reservado",
  sold: "Vendido",
}

export function CarEditTabs({
  car,
  photos,
}: {
  car: typeof cars.$inferSelect
  photos: (typeof carPhotos.$inferSelect)[]
}) {
  const router = useRouter()
  const [active, setActive] = useState<(typeof TABS)[number]>("Dados básicos")
  const [publishError, setPublishError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function publish() {
    setPublishError(null)
    startTransition(async () => {
      const result = await publishCarAction(car.id)
      if (!result.ok) {
        setPublishError(result.error.message)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <span className="w-fit rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-300">
          {STATUS_LABEL[car.status]}
        </span>
        {car.status === "draft" ? (
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              disabled={isPending}
              onClick={publish}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Publicando…" : "Publicar carro"}
            </button>
            {publishError ? <p className="text-xs text-red-400">{publishError}</p> : null}
          </div>
        ) : null}
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
      {active === "Laudo de inspeção" || active === "Histórico" ? (
        <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-sm text-neutral-400">
          Essa aba entra numa próxima etapa — ver{" "}
          <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">docs/ADMIN_ROUTES.md</code> (seção 4.5).
        </div>
      ) : null}
    </div>
  )
}
