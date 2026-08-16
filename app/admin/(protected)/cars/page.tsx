import type { Metadata } from "next"
import { desc, eq } from "drizzle-orm"
import Link from "next/link"
import { getDb } from "@/lib/db/client"
import { cars } from "@/lib/db/schema"

export const metadata: Metadata = { title: "Carros" }
export const dynamic = "force-dynamic"

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-neutral-800 text-neutral-300" },
  available: { label: "Disponível", className: "bg-emerald-950 text-emerald-300" },
  reserved: { label: "Reservado", className: "bg-amber-950 text-amber-300" },
  sold: { label: "Vendido", className: "bg-sky-950 text-sky-300" },
}

function formatPrice(price: string) {
  return Number(price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default async function AdminCarsPage() {
  const allCars = await getDb()
    .select()
    .from(cars)
    .where(eq(cars.archived, false))
    .orderBy(desc(cars.createdAt))

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Carros</h1>
          <p className="mt-1 text-sm text-neutral-400">Gerencie o estoque anunciado no site.</p>
        </div>
        <Link
          href="/admin/cars/new"
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
        >
          Novo carro
        </Link>
      </header>

      {allCars.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center">
          <p className="text-sm font-medium text-white">Nenhum carro cadastrado ainda</p>
          <p className="mt-1 text-sm text-neutral-400">
            Cadastre o primeiro carro para começar a montar a vitrine pública.
          </p>
          <Link
            href="/admin/cars/new"
            className="mt-4 inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
          >
            Cadastrar primeiro carro
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-800 rounded-xl border border-neutral-800">
          {allCars.map((car) => {
            const status = STATUS_LABEL[car.status]
            return (
              <Link
                key={car.id}
                href={`/admin/cars/${car.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-neutral-900"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-white">
                    {car.brand} {car.model}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {car.yearModel} · {car.km.toLocaleString("pt-BR")} km · {car.city}/{car.state}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-white">{formatPrice(car.price)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
