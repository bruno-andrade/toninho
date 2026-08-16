import type { Metadata } from "next"
import { asc, eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { getDb } from "@/lib/db/client"
import { sellerSubmissionPhotos, sellerSubmissions } from "@/lib/db/schema"
import { StatusForm } from "../status-form"

export const metadata: Metadata = { title: "Solicitação de venda" }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function SellRequestDetailPage(props: PageProps<"/admin/sell-requests/[id]">) {
  const { id } = await props.params
  if (!UUID_RE.test(id)) notFound()

  const db = getDb()
  const [[submission], photos] = await Promise.all([
    db.select().from(sellerSubmissions).where(eq(sellerSubmissions.id, id)).limit(1),
    db.select().from(sellerSubmissionPhotos).where(eq(sellerSubmissionPhotos.submissionId, id)).orderBy(asc(sellerSubmissionPhotos.position)),
  ])
  if (!submission) notFound()

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-white">
          {submission.brand} {submission.model} · {submission.year}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          {submission.km.toLocaleString("pt-BR")} km
          {submission.transmission ? ` · ${submission.transmission === "manual" ? "Manual" : "Automático"}` : ""}
          {submission.color ? ` · ${submission.color}` : ""}
        </p>
      </header>

      {submission.conditionNotes ? (
        <p className="rounded-lg bg-neutral-900 p-4 text-sm text-neutral-300">{submission.conditionNotes}</p>
      ) : null}

      {photos.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto">
          {photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element -- fotos enviadas por visitantes anônimos, sem otimização necessária pra uma tela interna
            <img key={photo.id} src={photo.url} alt="" className="h-28 w-40 flex-none rounded-lg object-cover" />
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">Nenhuma foto enviada.</p>
      )}

      <div className="rounded-xl border border-neutral-800 p-5">
        <h2 className="mb-3 text-sm font-semibold text-white">Contato do vendedor</h2>
        <div className="grid grid-cols-1 gap-2 text-sm text-neutral-300 sm:grid-cols-3">
          <span>
            Nome: <b className="text-white">{submission.sellerName}</b>
          </span>
          <span>
            Telefone:{" "}
            <a
              href={`https://wa.me/55${submission.sellerPhone}`}
              target="_blank"
              rel="noopener"
              className="font-bold text-orange-400 hover:underline"
            >
              {submission.sellerPhone}
            </a>
          </span>
          <span>
            Cidade: <b className="text-white">{submission.sellerCity ?? "—"}</b>
          </span>
        </div>
      </div>

      <StatusForm submissionId={submission.id} status={submission.status} internalNotes={submission.internalNotes ?? ""} />
    </div>
  )
}
