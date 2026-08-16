import type { Metadata } from "next"
import Link from "next/link"
import { and, count, desc, eq, gte, inArray } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { carEvents, cars, sellerSubmissions } from "@/lib/db/schema"

export const metadata: Metadata = { title: "Dashboard" }
export const dynamic = "force-dynamic"

function startOfCurrentMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export default async function AdminDashboardPage() {
  const db = getDb()
  const monthStart = startOfCurrentMonth()

  const [
    [activeCarsRow],
    [pendingSubmissionsRow],
    [whatsappClicksRow],
    [visitClicksRow],
    topClickedCars,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(cars)
      .where(inArray(cars.status, ["available", "reserved"])),
    db
      .select({ value: count() })
      .from(sellerSubmissions)
      .where(inArray(sellerSubmissions.status, ["novo", "em_analise"])),
    db
      .select({ value: count() })
      .from(carEvents)
      .where(and(eq(carEvents.type, "whatsapp_interest_click"), gte(carEvents.createdAt, monthStart))),
    db
      .select({ value: count() })
      .from(carEvents)
      .where(and(eq(carEvents.type, "visit_request_click"), gte(carEvents.createdAt, monthStart))),
    db
      .select({
        carId: carEvents.carId,
        brand: cars.brand,
        model: cars.model,
        clicks: count(carEvents.id),
      })
      .from(carEvents)
      .innerJoin(cars, eq(cars.id, carEvents.carId))
      .where(and(eq(carEvents.type, "whatsapp_interest_click"), gte(carEvents.createdAt, monthStart)))
      .groupBy(carEvents.carId, cars.brand, cars.model)
      .orderBy(desc(count(carEvents.id)))
      .limit(5),
  ])

  const metrics = [
    { label: "Carros ativos", value: String(activeCarsRow.value) },
    { label: 'Cliques em "Tenho interesse" (mês)', value: String(whatsappClicksRow.value) },
    { label: 'Cliques em "Agendar visita" (mês)', value: String(visitClicksRow.value) },
    { label: "Solicitações de venda pendentes", value: String(pendingSubmissionsRow.value) },
  ]

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-400">Resumo operacional do mês corrente.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
            <p className="text-sm text-neutral-400">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{metric.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="text-base font-semibold text-white">Carros mais clicados no mês</h2>
        {topClickedCars.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">
            Nenhum clique em &quot;Tenho interesse pelo WhatsApp&quot; registrado este mês ainda.
          </p>
        ) : (
          <ol className="mt-4 flex flex-col gap-2">
            {topClickedCars.map((car, index) => (
              <li key={car.carId} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-neutral-300">
                  {index + 1}. {car.brand} {car.model}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-neutral-400">{car.clicks} clique(s)</span>
                  <Link href={`/admin/cars/${car.carId}`} className="font-semibold text-white hover:underline">
                    Editar
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
