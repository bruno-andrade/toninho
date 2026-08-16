import type { Metadata } from "next"
import Link from "next/link"
import { CarCard } from "@/components/site/car-card"
import { getBrandFacets, getCoverPhotoMap, getFeaturedCars } from "@/lib/site/queries"

export const metadata: Metadata = {
  title: "Carros usados com procedência em Maceió/AL",
  description:
    "Compramos em leilões e com particulares, revisamos cada carro e só colocamos à venda depois de aprovado. Inspeção de 150+ itens e garantia de 3 meses.",
}

const PRICE_BANDS = [40000, 60000, 80000, 100000, 150000, 200000]

const TRUST_BADGES = [
  "Inspeção de 150+ itens",
  "Garantia de 3 meses",
  "Aceita seu carro na troca",
  "Pronto pra rodar",
]

const HOW_IT_WORKS = [
  { title: "Escolha seu carro", description: "Filtre por marca, preço e localização." },
  { title: "Veja o laudo completo", description: "Histórico e inspeção de 150+ itens." },
  { title: "Leve com garantia", description: "3 meses de garantia em todo carro." },
]

// ISR: sem isso a página seria pré-renderizada uma vez no build e nunca mais
// refletiria carros novos/editados. 60s é um atraso aceitável pra um site
// de concessionária (ninguém espera reflexo instantâneo).
export const revalidate = 60

export default async function HomePage() {
  const [featuredCars, brands] = await Promise.all([getFeaturedCars(6), getBrandFacets()])
  const coverByCarId = await getCoverPhotoMap(featuredCars.map((car) => car.id))

  return (
    <div>
      <section className="flex flex-col items-center gap-10 bg-[#F7F7F5] px-6 py-14 sm:flex-row sm:px-12 sm:py-16">
        <div className="flex max-w-xl flex-col gap-4">
          <span className="font-body text-[11px] font-bold uppercase tracking-wider text-[#FF5A36]">
            Carros usados, sem dor de cabeça
          </span>
          <h1 className="font-heading text-3xl font-extrabold leading-tight text-[#1A1A1A] sm:text-4xl">
            Seu próximo carro com a confiança do Toninho.
          </h1>
          <p className="font-body text-[15px] leading-relaxed text-[#6B6B68]">
            Compramos em leilões e com particulares, revisamos cada carro e só colocamos à venda depois de aprovado.
          </p>

          <form
            action="/busca"
            method="get"
            className="flex flex-col gap-3 rounded-2xl border border-[#E6E4DF] bg-white p-4 shadow-sm sm:flex-row sm:items-end"
          >
            <label className="flex flex-1 flex-col gap-1">
              <span className="font-body text-[11px] font-semibold text-[#6B6B68]">Marca</span>
              <select
                name="marca"
                defaultValue=""
                className="rounded-lg border border-[#E6E4DF] px-3 py-2 font-body text-[13px] text-[#1A1A1A]"
              >
                <option value="">Todas</option>
                {brands.map((brand) => (
                  <option key={brand.brand} value={brand.brand}>
                    {brand.brand} ({brand.count})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className="font-body text-[11px] font-semibold text-[#6B6B68]">Preço até</span>
              <select
                name="precoMax"
                defaultValue=""
                className="rounded-lg border border-[#E6E4DF] px-3 py-2 font-body text-[13px] text-[#1A1A1A]"
              >
                <option value="">Sem limite</option>
                {PRICE_BANDS.map((band) => (
                  <option key={band} value={band}>
                    R$ {band.toLocaleString("pt-BR")}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className="font-body text-[11px] font-semibold text-[#6B6B68]">Cidade</span>
              <input
                name="cidade"
                placeholder="Maceió, AL"
                className="rounded-lg border border-[#E6E4DF] px-3 py-2 font-body text-[13px] text-[#1A1A1A]"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-[#FF5A36] px-6 py-2.5 font-body text-[13px] font-bold text-white transition hover:bg-[#E14A28]"
            >
              Buscar carros
            </button>
          </form>
        </div>
        <div className="h-[280px] w-full flex-1 rounded-2xl bg-gradient-to-br from-[#F0EFEA] to-[#E2E0D9] sm:h-[340px]" />
      </section>

      <section className="flex flex-col justify-around gap-3 border-b border-[#E6E4DF] px-6 py-5 sm:flex-row sm:px-12">
        {TRUST_BADGES.map((badge) => (
          <span key={badge} className="font-body text-[13px] font-semibold text-[#1A1A1A]">
            ✓ {badge}
          </span>
        ))}
      </section>

      <section className="px-6 py-12 sm:px-12">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-heading text-xl font-extrabold text-[#1A1A1A] sm:text-2xl">Carros em destaque</h2>
          <Link href="/busca" className="font-body text-[13px] font-bold text-[#FF5A36]">
            Ver todos os carros ›
          </Link>
        </div>
        {featuredCars.length === 0 ? (
          <p className="font-body text-sm text-[#6B6B68]">
            Nenhum carro disponível no momento — volte em breve, estamos preparando o estoque.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} coverUrl={coverByCarId[car.id] ?? null} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#F1F0EC] px-6 py-12 sm:px-12">
        <h2 className="mb-6 font-heading text-xl font-extrabold text-[#1A1A1A] sm:text-2xl">Como funciona</h2>
        <div className="flex flex-col gap-5 sm:flex-row">
          {HOW_IT_WORKS.map((step, index) => (
            <div key={step.title} className="flex flex-1 flex-col gap-2 rounded-2xl bg-white p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF5A36] font-heading text-sm font-extrabold text-white">
                {index + 1}
              </span>
              <span className="font-heading text-sm font-bold text-[#1A1A1A]">{step.title}</span>
              <span className="font-body text-[13px] text-[#6B6B68]">{step.description}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
