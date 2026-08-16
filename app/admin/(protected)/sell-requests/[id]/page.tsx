import type { Metadata } from "next"

export const metadata: Metadata = { title: "Solicitação de venda" }

export default async function SellRequestDetailPage(props: PageProps<"/admin/sell-requests/[id]">) {
  const { id } = await props.params

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Solicitação de venda</h1>
        <p className="mt-1 text-sm text-neutral-400">ID: {id}</p>
      </header>
      <div className="rounded-xl border border-dashed border-neutral-800 p-10 text-center text-sm text-neutral-400">
        Detalhe ainda não conectado ao banco de dados — ver{" "}
        <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">docs/ADMIN_ROUTES.md</code> (seção 4.7).
      </div>
    </div>
  )
}
