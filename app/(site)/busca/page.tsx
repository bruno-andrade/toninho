import type { Metadata } from "next"
import Link from "next/link"
import { CarCardWide } from "@/components/site/car-card"
import { getBrandFacets, getCars, getCoverPhotoMap, type CarFilters } from "@/lib/site/queries"

export const metadata: Metadata = {
  title: "Comprar carros usados em Maceió/AL",
  description: "Filtre por marca, carroceria, preço, quilometragem e mais — todos os carros já inspecionados.",
}

const BODY_TYPES = [
  { value: "hatch", label: "Hatch" },
  { value: "sedan", label: "Sedã" },
  { value: "suv", label: "SUV" },
  { value: "pickup", label: "Picape" },
  { value: "wagon", label: "Perua" },
] as const

const SORT_OPTIONS = [
  { value: "relevancia", label: "Relevância" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "menor-km", label: "Menor km" },
] as const

type SearchParams = Record<string, string | string[] | undefined>

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return []
  const list = Array.isArray(value) ? value : value.split(",")
  return list.map((v) => v.trim()).filter(Boolean)
}

function toNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

function parseFilters(searchParams: SearchParams): CarFilters {
  return {
    brands: toArray(searchParams.marca),
    bodyTypes: toArray(searchParams.carroceria),
    transmission: Array.isArray(searchParams.cambio) ? searchParams.cambio[0] : searchParams.cambio,
    origin: Array.isArray(searchParams.origem) ? searchParams.origem[0] : searchParams.origem,
    armored: searchParams.blindado === "1",
    priceMin: toNumber(searchParams.precoMin),
    priceMax: toNumber(searchParams.precoMax),
    kmMin: toNumber(searchParams.kmMin),
    kmMax: toNumber(searchParams.kmMax),
    city: Array.isArray(searchParams.cidade) ? searchParams.cidade[0] : searchParams.cidade,
    sort: (Array.isArray(searchParams.ordenar) ? searchParams.ordenar[0] : searchParams.ordenar) as CarFilters["sort"],
    page: toNumber(searchParams.pagina) ?? 1,
  }
}

function pageHref(searchParams: SearchParams, page: number) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "pagina" || value == null) continue
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v))
    else params.set(key, value)
  }
  params.set("pagina", String(page))
  return `/busca?${params.toString()}`
}

export default async function BuscaPage(props: PageProps<"/busca">) {
  const searchParams = (await props.searchParams) as SearchParams
  const filters = parseFilters(searchParams)

  const [{ cars: results, total, page, pageCount }, brands] = await Promise.all([
    getCars(filters),
    getBrandFacets(),
  ])
  const coverByCarId = await getCoverPhotoMap(results.map((car) => car.id))

  const selectedBrands = new Set(filters.brands)
  const selectedBodyTypes = new Set(filters.bodyTypes)

  return (
    <div>
      <div className="px-6 py-4 font-body text-xs text-[#A8A59C] sm:px-12">
        <Link href="/" className="hover:text-[#FF5A36]">
          Início
        </Link>{" "}
        / Comprar carros
      </div>
      <div className="flex items-center justify-between border-b border-[#E6E4DF] px-6 pb-4 sm:px-12">
        <span className="font-body text-sm font-semibold text-[#1A1A1A]">{total} carros encontrados</span>
      </div>

      <div className="flex flex-col gap-8 px-6 py-8 sm:flex-row sm:px-12">
        <form method="get" className="flex w-full flex-none flex-col gap-5 sm:w-60">
          <div>
            <div className="mb-2 font-heading text-[13px] font-bold text-[#1A1A1A]">Ordenar por</div>
            <select
              name="ordenar"
              defaultValue={filters.sort ?? "relevancia"}
              className="w-full rounded-lg border border-[#E6E4DF] px-3 py-2 font-body text-[13px] text-[#1A1A1A]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 font-heading text-[13px] font-bold text-[#1A1A1A]">Marca</div>
            <div className="flex flex-col gap-1.5 font-body text-[13px] text-[#1A1A1A]">
              {brands.length === 0 ? (
                <span className="text-[#A8A59C]">Nenhuma marca disponível ainda</span>
              ) : (
                brands.map((brand) => (
                  <label key={brand.brand} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="marca"
                      value={brand.brand}
                      defaultChecked={selectedBrands.has(brand.brand)}
                    />
                    {brand.brand} ({brand.count})
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 font-heading text-[13px] font-bold text-[#1A1A1A]">Carroceria</div>
            <div className="flex flex-col gap-1.5 font-body text-[13px] text-[#1A1A1A]">
              {BODY_TYPES.map((type) => (
                <label key={type.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="carroceria"
                    value={type.value}
                    defaultChecked={selectedBodyTypes.has(type.value)}
                  />
                  {type.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 font-heading text-[13px] font-bold text-[#1A1A1A]">Preço</div>
            <div className="flex gap-2">
              <input
                type="number"
                name="precoMin"
                placeholder="Mín."
                defaultValue={filters.priceMin ?? ""}
                className="w-1/2 rounded-lg border border-[#E6E4DF] px-2 py-2 font-body text-xs text-[#1A1A1A]"
              />
              <input
                type="number"
                name="precoMax"
                placeholder="Máx."
                defaultValue={filters.priceMax ?? ""}
                className="w-1/2 rounded-lg border border-[#E6E4DF] px-2 py-2 font-body text-xs text-[#1A1A1A]"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 font-heading text-[13px] font-bold text-[#1A1A1A]">Quilometragem</div>
            <div className="flex gap-2">
              <input
                type="number"
                name="kmMin"
                placeholder="Km mín."
                defaultValue={filters.kmMin ?? ""}
                className="w-1/2 rounded-lg border border-[#E6E4DF] px-2 py-2 font-body text-xs text-[#1A1A1A]"
              />
              <input
                type="number"
                name="kmMax"
                placeholder="Km máx."
                defaultValue={filters.kmMax ?? ""}
                className="w-1/2 rounded-lg border border-[#E6E4DF] px-2 py-2 font-body text-xs text-[#1A1A1A]"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 font-heading text-[13px] font-bold text-[#1A1A1A]">Câmbio</div>
            <div className="flex flex-col gap-1.5 font-body text-[13px] text-[#1A1A1A]">
              <label className="flex items-center gap-2">
                <input type="radio" name="cambio" value="manual" defaultChecked={filters.transmission === "manual"} />
                Manual
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="cambio"
                  value="automatic"
                  defaultChecked={filters.transmission === "automatic"}
                />
                Automático
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="cambio" value="" defaultChecked={!filters.transmission} />
                Todos
              </label>
            </div>
          </div>

          <div>
            <div className="mb-2 font-heading text-[13px] font-bold text-[#1A1A1A]">Origem</div>
            <div className="flex flex-col gap-1.5 font-body text-[13px] text-[#1A1A1A]">
              <label className="flex items-center gap-2">
                <input type="radio" name="origem" value="particular" defaultChecked={filters.origin === "particular"} />
                Particular
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="origem" value="leilao" defaultChecked={filters.origin === "leilao"} />
                Leilão
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="origem" value="" defaultChecked={!filters.origin} />
                Todas
              </label>
            </div>
          </div>

          <label className="flex items-center gap-2 font-body text-[13px] text-[#1A1A1A]">
            <input type="checkbox" name="blindado" value="1" defaultChecked={filters.armored} />
            Só blindados
          </label>

          <button
            type="submit"
            className="rounded-lg bg-[#FF5A36] py-2.5 text-center font-body text-[13px] font-bold text-white"
          >
            Aplicar filtros
          </button>
        </form>

        <div className="flex flex-1 flex-col gap-6">
          {results.length === 0 ? (
            <p className="font-body text-sm text-[#6B6B68]">
              Nenhum carro encontrado com esses filtros. Tente ampliar a busca.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {results.map((car) => (
                <CarCardWide key={car.id} car={car} coverUrl={coverByCarId[car.id] ?? null} />
              ))}
            </div>
          )}

          {pageCount > 1 ? (
            <div className="flex justify-center gap-2 font-body text-sm font-semibold text-[#1A1A1A]">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={pageHref(searchParams, p)}
                  className={p === page ? "font-extrabold text-[#FF5A36]" : ""}
                >
                  {p}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
