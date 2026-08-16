import Image from "next/image"
import Link from "next/link"
import type { cars } from "@/lib/db/schema"
import { formatKm, formatPrice, originLabel, transmissionLabel } from "@/lib/site/format"
import { FavoriteButton } from "./favorite-button"

type Car = typeof cars.$inferSelect

function CoverImage({ url, alt, sizes }: { url: string | null; alt: string; sizes: string }) {
  if (!url) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F0EFEA] to-[#E2E0D9] text-[10px] font-semibold uppercase tracking-wide text-[#A8A59C]">
        Foto do carro
      </div>
    )
  }
  return <Image src={url} alt={alt} fill sizes={sizes} className="object-cover" />
}

/** Card vertical — usado na Home (destaques) e em "Carros parecidos". */
export function CarCard({ car, coverUrl }: { car: Car; coverUrl: string | null }) {
  return (
    <Link
      href={`/carro/${car.slug}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-[#E6E4DF] bg-white"
    >
      <div className="relative h-[150px] w-full">
        <CoverImage url={coverUrl} alt={`${car.brand} ${car.model}`} sizes="(min-width: 1024px) 360px, 45vw" />
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex justify-end">
          <FavoriteButton carId={car.id} />
        </div>
        <span className="font-heading text-[15px] font-bold text-[#1A1A1A]">
          {car.brand} {car.model}
        </span>
        <span className="font-body text-xs font-medium text-[#6B6B68]">
          {car.yearModel} · {formatKm(car.km)} · {car.city}/{car.state}
        </span>
        <span className="font-heading text-lg font-extrabold text-[#1A1A1A]">{formatPrice(car.price)}</span>
      </div>
    </Link>
  )
}

/** Card horizontal — usado na Listagem/Busca e em Favoritos. */
export function CarCardWide({ car, coverUrl }: { car: Car; coverUrl: string | null }) {
  return (
    <Link href={`/carro/${car.slug}`} className="flex overflow-hidden rounded-2xl border border-[#E6E4DF] bg-white">
      <div className="relative h-auto w-40 flex-none">
        <CoverImage url={coverUrl} alt={`${car.brand} ${car.model}`} sizes="160px" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="w-fit rounded-full bg-[#EAF1FE] px-2 py-0.5 font-body text-[9px] font-bold text-[#1F6FEB]">
            {originLabel(car.origin)}
          </span>
          <FavoriteButton carId={car.id} />
        </div>
        <span className="font-heading text-sm font-bold text-[#1A1A1A]">
          {car.brand} {car.model}
        </span>
        <span className="font-body text-xs font-medium text-[#6B6B68]">
          {car.yearModel} · {formatKm(car.km)} · {transmissionLabel(car.transmission)}
        </span>
        <span className="font-heading text-lg font-extrabold text-[#1A1A1A]">{formatPrice(car.price)}</span>
        <span className="font-body text-xs font-medium text-[#6B6B68]">
          {car.city}/{car.state}
        </span>
      </div>
    </Link>
  )
}
