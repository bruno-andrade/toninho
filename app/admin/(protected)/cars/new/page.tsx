import type { Metadata } from "next"
import { CarForm } from "./car-form"

export const metadata: Metadata = { title: "Novo carro" }

export default function NewCarPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Novo carro</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Dados básicos do anúncio. Fotos, laudo de inspeção e histórico são preenchidos depois de salvar (ver{" "}
          <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">docs/ADMIN_ROUTES.md</code>).
        </p>
      </header>
      <CarForm />
    </div>
  )
}
