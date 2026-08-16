import type { Metadata } from "next"
import { asc, desc, eq, inArray } from "drizzle-orm"
import Link from "next/link"
import { getDb } from "@/lib/db/client"
import { sellerSubmissionPhotos, sellerSubmissions } from "@/lib/db/schema"

export const metadata: Metadata = { title: "Solicitações de venda" }
export const dynamic = "force-dynamic"

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  novo: { label: "Novo", className: "bg-orange-950 text-orange-300" },
  em_analise: { label: "Em análise", className: "bg-amber-950 text-amber-300" },
  proposta_enviada: { label: "Proposta enviada", className: "bg-sky-950 text-sky-300" },
  recusado: { label: "Recusado", className: "bg-neutral-800 text-neutral-400" },
  comprado: { label: "Comprado", className: "bg-emerald-950 text-emerald-300" },
}

const STATUS_FILTERS = [
  { value: "", label: "Todos os status" },
  { value: "novo", label: "Novo" },
  { value: "em_analise", label: "Em análise" },
  { value: "proposta_enviada", label: "Proposta enviada" },
  { value: "recusado", label: "Recusado" },
  { value: "comprado", label: "Comprado" },
] as const

export default async function SellRequestsPage(props: PageProps<"/admin/sell-requests">) {
  const searchParams = (await props.searchParams) as { status?: string }
  const status = searchParams.status ?? ""

  const db = getDb()
  const submissions = status
    ? await db
        .select()
        .from(sellerSubmissions)
        .where(eq(sellerSubmissions.status, status as (typeof sellerSubmissions.status.enumValues)[number]))
        .orderBy(desc(sellerSubmissions.createdAt))
    : await db.select().from(sellerSubmissions).orderBy(desc(sellerSubmissions.createdAt))

  const photos = submissions.length
    ? await db
        .select()
        .from(sellerSubmissionPhotos)
        .where(inArray(sellerSubmissionPhotos.submissionId, submissions.map((s) => s.id)))
        .orderBy(asc(sellerSubmissionPhotos.position))
    : []
  const firstPhotoBySubmission: Record<string, string> = {}
  for (const photo of photos) {
    if (!firstPhotoBySubmission[photo.submissionId]) firstPhotoBySubmission[photo.submissionId] = photo.url
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Solicitações de venda</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Pedidos recebidos pelo formulário público &quot;Vender meu carro&quot;.
        </p>
      </header>

      <form method="get" className="flex items-center gap-3">
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-300 hover:border-neutral-500"
        >
          Filtrar
        </button>
      </form>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center">
          <p className="text-sm font-medium text-white">Nenhuma solicitação encontrada</p>
          <p className="mt-1 text-sm text-neutral-400">
            Assim que alguém enviar o formulário público, as solicitações aparecem aqui.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-800 rounded-xl border border-neutral-800">
          {submissions.map((submission) => {
            const statusMeta = STATUS_LABEL[submission.status]
            return (
              <Link
                key={submission.id}
                href={`/admin/sell-requests/${submission.id}`}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-neutral-900"
              >
                <div
                  className="h-14 w-20 flex-none rounded-lg bg-neutral-800 bg-cover bg-center"
                  style={
                    firstPhotoBySubmission[submission.id]
                      ? { backgroundImage: `url(${firstPhotoBySubmission[submission.id]})` }
                      : undefined
                  }
                />
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-semibold text-white">
                    {submission.brand} {submission.model} · {submission.year}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {submission.sellerName} · {submission.sellerPhone}
                    {submission.sellerCity ? ` · ${submission.sellerCity}` : ""}
                  </span>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.className}`}>
                  {statusMeta.label}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
