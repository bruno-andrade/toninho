import type { Metadata } from "next"
import { count, inArray } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { cars, sellerSubmissions } from "@/lib/db/schema"

export const metadata: Metadata = { title: "Dashboard" }
export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const db = getDb()

  const [[activeCarsRow], [pendingSubmissionsRow]] = await Promise.all([
    db
      .select({ value: count() })
      .from(cars)
      .where(inArray(cars.status, ["available", "reserved"])),
    db
      .select({ value: count() })
      .from(sellerSubmissions)
      .where(inArray(sellerSubmissions.status, ["novo", "em_analise"])),
  ])

  const metrics = [
    { label: "Carros ativos", value: String(activeCarsRow.value) },
    { label: 'Cliques em "Tenho interesse" (mês)', value: "—" },
    { label: 'Cliques em "Agendar visita" (mês)', value: "—" },
    { label: "Solicitações de venda pendentes", value: String(pendingSubmissionsRow.value) },
  ]

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Resumo operacional. Cliques em WhatsApp/agendamento aparecem aqui quando o rastreamento de{" "}
          <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">car_events</code> estiver ligado no site
          público.
        </p>
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
        <p className="mt-2 text-sm text-neutral-400">
          Nenhum dado ainda — esta lista usa os eventos registrados em{" "}
          <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">car_events</code>.
        </p>
      </section>
    </div>
  )
}
