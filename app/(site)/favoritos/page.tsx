import type { Metadata } from "next"
import { FavoritosClient } from "./favoritos-client"

export const metadata: Metadata = {
  title: "Meus favoritos",
  robots: { index: false, follow: false },
}

export default function FavoritosPage() {
  return (
    <div className="px-6 py-10 sm:px-12">
      <h1 className="mb-6 font-heading text-2xl font-extrabold text-[#1A1A1A]">Meus favoritos</h1>
      <FavoritosClient />
    </div>
  )
}
