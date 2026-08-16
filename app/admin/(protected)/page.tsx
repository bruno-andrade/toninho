import type { Metadata } from "next"

export const metadata: Metadata = { title: "Dashboard" }

const METRICS = [
  { label: 'Carros ativos', value: "—" },
  { label: 'Cliques em "Tenho interesse" (mês)', value: "—" },
  { label: 'Cliques em "Agendar visita" (mês)', value: "—" },
  { label: "Solicitações de venda pendentes", value: "—" },
] as const

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Resumo operacional. Os números aparecem aqui assim que o banco de dados estiver conectado (ver{" "}
          <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">docs/DATA_MODEL.md</code>).
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
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
