import type { Metadata } from "next"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { getDb } from "@/lib/db/client"
import { cars } from "@/lib/db/schema"
import { EditCarForm } from "./edit-car-form"

export const metadata: Metadata = { title: "Editar carro" }

const TABS = ["Dados básicos", "Fotos", "Laudo de inspeção", "Histórico"] as const

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function EditCarPage(props: PageProps<"/admin/cars/[carId]">) {
  const { carId } = await props.params
  if (!UUID_RE.test(carId)) notFound()

  const [car] = await getDb().select().from(cars).where(eq(cars.id, carId)).limit(1)
  if (!car) notFound()

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-white">
          {car.brand} {car.model}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">{car.slug}</p>
      </header>

      <div className="flex gap-2 border-b border-neutral-800">
        {TABS.map((tab, index) => (
          <span
            key={tab}
            className={`px-4 py-2 text-sm font-medium ${
              index === 0 ? "border-b-2 border-orange-500 text-white" : "text-neutral-500"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>

      <EditCarForm car={car} />

      <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-sm text-neutral-400">
        Fotos, laudo de inspeção e histórico entram numa próxima etapa (upload de imagens via Vercel Blob) — ver{" "}
        <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">docs/ADMIN_ROUTES.md</code> (seção 4.5).
      </div>
    </div>
  )
}
