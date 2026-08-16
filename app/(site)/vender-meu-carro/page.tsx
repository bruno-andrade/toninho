import type { Metadata } from "next"
import { SellForm } from "./sell-form"

export const metadata: Metadata = {
  title: "Vender meu carro",
  description: "Ofereça seu carro para a AuToninho comprar diretamente, sem burocracia.",
}

export default function VenderMeuCarroPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-14 sm:px-12">
      <div className="flex flex-col gap-3">
        <span className="font-body text-[11px] font-bold uppercase tracking-wider text-[#FF5A36]">
          Vender meu carro
        </span>
        <h1 className="font-heading text-3xl font-extrabold text-[#1A1A1A]">
          Venda seu carro direto para a AuToninho
        </h1>
        <p className="font-body text-[15px] leading-relaxed text-[#6B6B68]">
          Preencha os dados do seu carro e algumas fotos. Nossa equipe avalia e entra em contato com uma proposta —
          sem precisar anunciar por conta própria.
        </p>
      </div>
      <SellForm />
    </div>
  )
}
