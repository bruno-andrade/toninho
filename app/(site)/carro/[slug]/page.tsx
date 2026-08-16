import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CarCard } from "@/components/site/car-card"
import { ScheduleVisitButton, WhatsappInterestButton } from "@/components/site/cta-buttons"
import { FavoriteButton } from "@/components/site/favorite-button"
import { DetailViewTracker } from "@/components/site/detail-view-tracker"
import { buildWhatsappUrl, getSiteSettings } from "@/lib/site/settings"
import {
  formatKm,
  formatPrice,
  fuelLabel,
  inspectionCategoryLabel,
  inspectionStatusLabel,
  originLabel,
  transmissionLabel,
} from "@/lib/site/format"
import { getCarBySlug, getCoverPhotoMap, getRelatedCars } from "@/lib/site/queries"

export async function generateMetadata(props: PageProps<"/carro/[slug]">): Promise<Metadata> {
  const { slug } = await props.params
  const result = await getCarBySlug(slug)
  if (!result) return {}
  const { car, photos } = result
  const cover = photos.find((p) => p.isCover)?.url ?? photos[0]?.url
  const title = `${car.brand} ${car.model} ${car.yearModel}`
  const description = `${car.yearModel} · ${formatKm(car.km)} · ${formatPrice(car.price)} — à venda em ${car.city}/${car.state}, inspecionado (150+ itens) e com garantia de 3 meses.`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: cover ? [{ url: cover }] : undefined,
    },
  }
}

// ISR por slug (sem generateStaticParams, então cada carro é renderizado sob
// demanda no 1º acesso e fica em cache por até 60s depois disso).
export const revalidate = 60

export default async function CarDetailPage(props: PageProps<"/carro/[slug]">) {
  const { slug } = await props.params
  const result = await getCarBySlug(slug)
  if (!result) notFound()
  const { car, photos, inspection, history } = result

  const [relatedCars, settings] = await Promise.all([getRelatedCars(car), getSiteSettings()])
  const relatedCoverMap = await getCoverPhotoMap(relatedCars.map((c) => c.id))

  const cover = photos.find((p) => p.isCover) ?? photos[0]
  const whatsappMessage = `Olá! Tenho interesse no ${car.brand} ${car.model} (${formatPrice(car.price)}) anunciado no AuToninho.`
  const whatsappUrl = buildWhatsappUrl(settings.whatsappNumber, whatsappMessage)
  const visitMessage = `Olá! Gostaria de agendar uma visita para ver o ${car.brand} ${car.model} anunciado no AuToninho.`
  const visitUrl = buildWhatsappUrl(settings.whatsappNumber, visitMessage)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${car.brand} ${car.model}`,
    brand: car.brand,
    model: car.model,
    vehicleModelDate: String(car.yearModel),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: car.km, unitCode: "KMT" },
    fuelType: fuelLabel(car.fuel),
    vehicleTransmission: transmissionLabel(car.transmission),
    color: car.color,
    image: photos.map((p) => p.url),
    offers: {
      "@type": "Offer",
      price: car.price,
      priceCurrency: "BRL",
      availability: car.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
  }

  return (
    <div>
      <DetailViewTracker carId={car.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="px-6 py-4 font-body text-xs text-[#6B6B68] sm:px-12">
        <Link href="/" className="hover:text-[#C93A1A]">
          Início
        </Link>{" "}
        /{" "}
        <Link href="/busca" className="hover:text-[#C93A1A]">
          Comprar carros
        </Link>{" "}
        / {car.brand} / {car.model}
      </div>

      <div className="flex flex-col gap-10 px-6 pb-10 sm:flex-row sm:px-12">
        <div className="flex flex-1 flex-col gap-2.5" style={{ flexGrow: 1.4 }}>
          <div className="relative h-[280px] w-full overflow-hidden rounded-2xl bg-[#E2E0D9] sm:h-[360px]">
            {cover ? (
              <Image src={cover.url} alt={`${car.brand} ${car.model}`} fill sizes="700px" priority className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center font-body text-xs font-semibold uppercase text-[#5A5A57]">
                Galeria de fotos
              </div>
            )}
          </div>
          {photos.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto">
              {photos.map((photo) => (
                <div key={photo.id} className="relative h-[58px] w-20 flex-none overflow-hidden rounded-lg bg-[#E2E0D9]">
                  <Image src={photo.url} alt="" fill sizes="80px" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex w-full flex-none flex-col gap-3.5 rounded-2xl border border-[#E6E4DF] p-6 sm:w-[360px]">
          <span className="w-fit rounded-full bg-[#F1F0EC] px-2 py-0.5 font-body text-[10px] font-bold text-[#6B6B68]">
            {originLabel(car.origin)}
          </span>
          <div className="flex items-start justify-between gap-2.5">
            <h1 className="font-heading text-xl font-extrabold text-[#1A1A1A]">
              {car.brand} {car.model}
            </h1>
            <FavoriteButton carId={car.id} size={22} />
          </div>
          <span className="font-body text-[13px] font-medium text-[#6B6B68]">
            {car.yearModel} · {formatKm(car.km)} · {car.city}, {car.state}
          </span>
          <div className="h-px bg-[#E6E4DF]" />
          <div>
            <span className="font-heading text-[28px] font-extrabold text-[#1A1A1A]">{formatPrice(car.price)}</span>
            <div className="font-body text-xs text-[#6B6B68]">À vista — sem financiamento</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Cartão", "Pix", "Débito", "Dinheiro"].map((method) => (
              <span key={method} className="rounded-md border border-[#E6E4DF] px-2.5 py-1 font-body text-[11px] font-semibold text-[#1A1A1A]">
                {method}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            <WhatsappInterestButton carId={car.id} href={whatsappUrl} />
            <ScheduleVisitButton carId={car.id} href={visitUrl} />
          </div>
          <div className="h-px bg-[#E6E4DF]" />
          <div className="grid grid-cols-2 gap-2.5 font-body text-xs text-[#6B6B68]">
            <span>
              Ano <b className="text-[#1A1A1A]">{car.yearModel}</b>
            </span>
            <span>
              KM <b className="text-[#1A1A1A]">{formatKm(car.km)}</b>
            </span>
            <span>
              Câmbio <b className="text-[#1A1A1A]">{transmissionLabel(car.transmission)}</b>
            </span>
            <span>
              Combustível <b className="text-[#1A1A1A]">{fuelLabel(car.fuel)}</b>
            </span>
            <span>
              Cor <b className="text-[#1A1A1A]">{car.color}</b>
            </span>
            <span>
              Origem <b className="text-[#1A1A1A]">{originLabel(car.origin)}</b>
            </span>
          </div>
          <div className="rounded-lg bg-[#F7F7F5] p-3 font-body text-xs font-semibold text-[#1A1A1A]">
            Vendido e entregue por AuToninho — Loja {car.city}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-9 px-6 pb-12 sm:px-12">
        <section>
          <h2 className="mb-4 font-heading text-lg font-extrabold text-[#1A1A1A]">Detalhes do veículo</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-6 rounded-2xl border border-[#E6E4DF] p-6 sm:grid-cols-3">
            <Spec label="Ano" value={`${car.yearFab}/${car.yearModel}`} />
            <Spec label="Km" value={formatKm(car.km)} />
            {car.marketValue ? <Spec label="Fipe" value={formatPrice(car.marketValue)} /> : null}
            <Spec label="Combustível" value={fuelLabel(car.fuel)} />
            <Spec label="Cor" value={car.color} />
            <Spec label="Possui chave reserva" value={car.hasSpareKey ? "Sim" : "Não"} />
            {car.docTransferDays ? <Spec label="Prazo est. documentação" value={`${car.docTransferDays} dias úteis`} /> : null}
            <Spec label="Origem" value={originLabel(car.origin)} />
          </div>
        </section>

        {inspection.length > 0 ? (
          <section>
            <h2 className="mb-4 font-heading text-lg font-extrabold text-[#1A1A1A]">Laudo de inspeção</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {inspection.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-[#F7F7F5] px-3 py-3 font-body text-xs font-semibold text-[#1A1A1A]"
                >
                  {inspectionCategoryLabel(item.category)}
                  <span
                    className={
                      item.status === "aprovado"
                        ? "text-[#1A8A52]"
                        : item.status === "reparo_leve"
                          ? "text-[#B8860B]"
                          : "text-[#B8860B]"
                    }
                  >
                    {item.status === "aprovado" ? "✓" : "⚠"} {inspectionStatusLabel(item.status)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {history ? (
          <section>
            <h2 className="mb-4 font-heading text-lg font-extrabold text-[#1A1A1A]">Histórico do veículo</h2>
            <div className="flex flex-col gap-2 font-body text-[13px] text-[#1A1A1A]">
              <span>
                ✓ {history.previousOwnersCount} dono{history.previousOwnersCount === 1 ? "" : "s"} anterior
                {history.previousOwnersCount === 1 ? "" : "es"}
              </span>
              <span>{history.hadAccidentRecord ? "⚠ Possui registro de sinistro" : "✓ Sem registro de sinistro"}</span>
              {history.dealerServicedUntilYear ? (
                <span>✓ Revisões em concessionária até {history.dealerServicedUntilYear}</span>
              ) : null}
              {history.inspectedByTeam ? <span>✓ Revisado pela equipe AuToninho</span> : null}
              {history.additionalNotes ? <span>{history.additionalNotes}</span> : null}
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="mb-4 font-heading text-lg font-extrabold text-[#1A1A1A]">Localização</h2>
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="h-[200px] w-full flex-none rounded-xl bg-gradient-to-br from-[#F0EFEA] to-[#E2E0D9] sm:w-[480px]" />
            <div className="pt-2 font-body text-[13px] text-[#6B6B68]">
              Loja AuToninho {settings.city}
              <br />
              {settings.addressStreet}
              {settings.addressNeighborhood ? ` — ${settings.addressNeighborhood}` : ""}
              <br />
              {settings.city}, {settings.state} — CEP {settings.zipCode}
            </div>
          </div>
        </section>

        {relatedCars.length > 0 ? (
          <section>
            <h2 className="mb-4 font-heading text-lg font-extrabold text-[#1A1A1A]">Carros parecidos</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {relatedCars.map((related) => (
                <CarCard key={related.id} car={related} coverUrl={relatedCoverMap[related.id] ?? null} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-body text-[13px] text-[#6B6B68]">{label}</span>
      <span className="font-heading text-[15px] font-bold text-[#1A1A1A]">{value}</span>
    </div>
  )
}
