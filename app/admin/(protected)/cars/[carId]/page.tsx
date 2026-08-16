import type { Metadata } from "next"

export const metadata: Metadata = { title: "Editar carro" }

const TABS = ["Dados básicos", "Fotos", "Laudo de inspeção", "Histórico"] as const

export default async function EditCarPage(props: PageProps<"/admin/cars/[carId]">) {
  const { carId } = await props.params

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Editar carro</h1>
        <p className="mt-1 text-sm text-neutral-400">ID: {carId}</p>
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

      <div className="rounded-xl border border-dashed border-neutral-800 p-10 text-center text-sm text-neutral-400">
        Edição ainda não conectada ao banco de dados. As abas acima seguem a estrutura definida em{" "}
        <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">docs/ADMIN_ROUTES.md</code> (seção 4.5).
      </div>
    </div>
  )
}
