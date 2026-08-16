import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Carros" }

export default function AdminCarsPage() {
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

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Buscar por marca ou modelo"
          disabled
          className="w-72 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 placeholder:text-neutral-500 disabled:cursor-not-allowed"
        />
        <select
          disabled
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 disabled:cursor-not-allowed"
        >
          <option>Todos os status</option>
        </select>
      </div>

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
    </div>
  )
}
