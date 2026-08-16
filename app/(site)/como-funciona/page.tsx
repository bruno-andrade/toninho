import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Como funciona",
  description: "Entenda como funciona comprar um carro usado com a confiança do Toninho.",
}

const STEPS = [
  {
    title: "Escolha seu carro",
    description:
      "Filtre por marca, preço e localização na nossa listagem. Todos os carros do estoque já passaram por avaliação antes de entrar no site.",
  },
  {
    title: "Veja o laudo completo",
    description:
      "Cada anúncio traz o histórico do veículo (dono anterior, sinistro, revisões) e o resultado da inspeção de mais de 150 itens — motor, câmbio, estrutura, pintura, pneus, elétrica e documentação.",
  },
  {
    title: "Leve com garantia",
    description:
      "Compra à vista (cartão, Pix, débito ou dinheiro) e 3 meses de garantia em qualquer carro do estoque, sem burocracia extra na documentação.",
  },
]

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-14 sm:px-12">
      <div className="flex flex-col gap-3">
        <span className="font-body text-[11px] font-bold uppercase tracking-wider text-[#FF5A36]">
          Como funciona
        </span>
        <h1 className="font-heading text-3xl font-extrabold text-[#1A1A1A]">
          Comprar um carro usado sem dor de cabeça
        </h1>
        <p className="font-body text-[15px] leading-relaxed text-[#6B6B68]">
          Compramos carros em leilões e com particulares, revisamos cada um e só colocamos à venda depois de
          aprovados na nossa inspeção.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {STEPS.map((step, index) => (
          <div key={step.title} className="flex gap-4 rounded-2xl border border-[#E6E4DF] p-6">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#FF5A36] font-heading text-sm font-extrabold text-white">
              {index + 1}
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="font-heading text-base font-bold text-[#1A1A1A]">{step.title}</span>
              <span className="font-body text-sm leading-relaxed text-[#6B6B68]">{step.description}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-[#F7F7F5] p-6 font-body text-sm leading-relaxed text-[#6B6B68]">
        Origem dos carros: compramos em leilão e diretamente com particulares, sempre revisando antes de anunciar.
        O prazo de documentação varia por carro (indicado em cada anúncio), sem burocracia extra para o comprador.
      </div>
    </div>
  )
}
