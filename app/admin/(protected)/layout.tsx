import type { Metadata } from "next"
import Link from "next/link"
import { logoutAction } from "./actions"

export const metadata: Metadata = {
  title: { template: "%s — Painel AuToninho", default: "Painel AuToninho" },
  robots: { index: false, follow: false },
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/cars", label: "Carros" },
  { href: "/admin/sell-requests", label: "Solicitações de venda" },
  { href: "/admin/settings", label: "Configurações" },
] as const

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <aside className="flex w-60 flex-none flex-col justify-between border-r border-neutral-800 bg-neutral-900 p-5">
        <div>
          <p className="mb-8 text-lg font-extrabold">
            Au<span className="text-orange-500">Toninho</span>
          </p>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
          >
            Sair
          </button>
        </form>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
