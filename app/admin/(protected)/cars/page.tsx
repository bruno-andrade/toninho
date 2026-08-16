import type { Metadata } from "next"
import { and, desc, eq, ilike, or } from "drizzle-orm"
import Link from "next/link"
import { getDb } from "@/lib/db/client"
import { cars } from "@/lib/db/schema"
import { QuickStatusSelect } from "./quick-status-select"

export const metadata: Metadata = { title: "Carros" }
export const dynamic = "force-dynamic"

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-neutral-800 text-neutral-300" },
  available: { label: "Disponível", className: "bg-emerald-950 text-emerald-300" },
  reserved: { label: "Reservado", className: "bg-amber-950 text-amber-300" },
  sold: { label: "Vendido", className: "bg-sky-950 text-sky-300" },
}

const STATUS_FILTERS = [
  { value: "", label: "Todos os status" },
  { value: "draft", label: "Rascunho" },
  { value: "available", label: "Disponível" },
  { value: "reserved", label: "Reservado" },
  { value: "sold", label: "Vendido" },
] as const

function formatPrice(price: string) {
  return Number(price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

type SearchParams = { q?: string; status?: string }

export default async function AdminCarsPage(props: PageProps<"/admin/cars">) {
  const searchParams = (await props.searchParams) as SearchParams
  const q = searchParams.q?.trim() ?? ""
  const status = searchParams.status ?? ""

  const conditions = [eq(cars.archived, false)]
  if (status) conditions.push(eq(cars.status, status as (typeof cars.status.enumValues)[number]))
  if (q) conditions.push(or(ilike(cars.brand, `%${q}%`), ilike(cars.model, `%${q}%`))!)

  const allCars = await getDb()
    .select()
    .from(cars)
    .where(and(...conditions))
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

      <form method="get" className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por marca ou modelo"
          className="w-72 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-300 hover:border-neutral-500"
        >
          Filtrar
        </button>
      </form>

      {allCars.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center">
          <p className="text-sm font-medium text-white">
            {q || status ? "Nenhum carro encontrado com esses filtros" : "Nenhum carro cadastrado ainda"}
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            {q || status
              ? "Tente ajustar a busca ou o filtro de status."
              : "Cadastre o primeiro carro para começar a montar a vitrine pública."}
          </p>
          {!q && !status ? (
            <Link
              href="/admin/cars/new"
              className="mt-4 inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
            >
              Cadastrar primeiro carro
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-800 rounded-xl border border-neutral-800">
          {allCars.map((car) => {
            const statusMeta = STATUS_LABEL[car.status]
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
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">{formatPrice(car.price)}</span>
                  {car.status === "draft" ? (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.className}`}>
                      {statusMeta.label}
                    </span>
                  ) : (
                    <QuickStatusSelect carId={car.id} status={car.status as "available" | "reserved" | "sold"} />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
