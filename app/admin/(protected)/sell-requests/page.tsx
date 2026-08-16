import type { Metadata } from "next"

export const metadata: Metadata = { title: "Solicitações de venda" }

export default function SellRequestsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Solicitações de venda</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Pedidos recebidos pelo formulário público &quot;Vender meu carro&quot;.
        </p>
      </header>

      <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center">
        <p className="text-sm font-medium text-white">Nenhuma solicitação recebida ainda</p>
        <p className="mt-1 text-sm text-neutral-400">
          Assim que o formulário público estiver no ar, as solicitações aparecem aqui.
        </p>
      </div>
    </div>
  )
}
