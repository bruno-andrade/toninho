"use client"

import Link from "next/link"
import { useFavorites } from "./favorites-provider"

const NAV_LINKS = [
  { href: "/busca", label: "Comprar carros" },
  { href: "/vender-meu-carro", label: "Vender meu carro" },
  { href: "/como-funciona", label: "Como funciona" },
] as const

export function SiteHeader() {
  const { count } = useFavorites()

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E6E4DF] bg-white px-6 py-0 sm:px-12" style={{ height: 76 }}>
      <Link href="/" className="font-heading text-xl font-extrabold text-[#1A1A1A]">
        Au<span className="text-[#C93A1A]">Toninho</span>
      </Link>
      <nav className="hidden gap-7 font-body text-sm font-semibold text-[#1A1A1A] sm:flex">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-[#C93A1A]">
            {link.label}
          </Link>
        ))}
      </nav>
      <Link href="/favoritos" className="flex items-center gap-2 font-body text-sm font-bold text-[#1A1A1A]">
        <span style={{ fontSize: 17, color: "#C93A1A" }}>{count > 0 ? "♥" : "♡"}</span>
        <span>{count} favoritos</span>
      </Link>
    </header>
  )
}
