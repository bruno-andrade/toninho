"use client"

import { upload } from "@vercel/blob/client"
import { useActionState, useRef, useState } from "react"
import { Field, SelectField } from "@/components/site/form-field"
import { submitSellRequestAction, type SubmitSellRequestState } from "./actions"

const initialState: SubmitSellRequestState = null

const TRANSMISSIONS = [
  { value: "", label: "Não sei / não informar" },
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automático" },
] as const

function fieldError(state: SubmitSellRequestState, field: string) {
  if (!state || state.ok) return undefined
  return state.error.fieldErrors?.[field]?.[0]
}

export function SellForm() {
  const [state, formAction, pending] = useActionState(submitSellRequestAction, initialState)
  const inputRef = useRef<HTMLInputElement>(null)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setUploading(true)
    setUploadError(null)
    const submissionFolder = crypto.randomUUID()

    try {
      const uploaded: string[] = []
      for (const file of Array.from(fileList)) {
        const pathname = `sell-requests/${submissionFolder}/${crypto.randomUUID()}-${file.name}`
        const blob = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: "/api/sell-request-photos/upload-token",
        })
        uploaded.push(blob.url)
      }
      setPhotoUrls((prev) => [...prev, ...uploaded])
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falha ao enviar foto.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-[#E6E4DF] p-8 text-center">
        <span className="mb-2 block font-heading text-lg font-bold text-[#1A1A1A]">
          Solicitação enviada!
        </span>
        <p className="font-body text-sm text-[#6B6B68]">
          A equipe AuToninho vai entrar em contato em até 2 dias úteis para avaliar seu carro.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {photoUrls.map((url) => (
        <input key={url} type="hidden" name="photoUrls" value={url} />
      ))}

      {state && !state.ok && state.error.code !== "VALIDATION_ERROR" ? (
        <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 font-body text-sm text-amber-800">
          {state.error.message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Marca" name="brand" error={fieldError(state, "brand")} />
        <Field label="Modelo" name="model" error={fieldError(state, "model")} />
        <Field label="Ano" name="year" type="number" error={fieldError(state, "year")} />
        <Field label="Quilometragem" name="km" type="number" error={fieldError(state, "km")} />
        <SelectField label="Câmbio" name="transmission" options={TRANSMISSIONS} />
        <Field label="Cor" name="color" required={false} />
      </div>

      <Field label="Estado de conservação / observações" name="conditionNotes" required={false} />

      <div className="flex flex-col gap-1.5">
        <span className="font-body text-[13px] font-semibold text-[#1A1A1A]">Fotos do carro</span>
        <label className="inline-block w-fit cursor-pointer rounded-lg border border-[#E6E4DF] px-4 py-2 font-body text-sm font-semibold text-[#1A1A1A]">
          {uploading ? "Enviando…" : "Adicionar fotos"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(event) => handleFilesSelected(event.target.files)}
          />
        </label>
        <span className="font-body text-xs text-[#6B6B68]">{photoUrls.length} foto(s) anexada(s)</span>
        {uploadError ? <p className="font-body text-xs text-red-600">{uploadError}</p> : null}
        {fieldError(state, "photos") ? (
          <p className="font-body text-xs text-red-600">{fieldError(state, "photos")}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Seu nome" name="sellerName" error={fieldError(state, "sellerName")} />
        <Field label="Seu telefone (com DDD)" name="sellerPhone" error={fieldError(state, "sellerPhone")} />
        <Field label="Sua cidade" name="sellerCity" required={false} />
      </div>

      <p className="font-body text-xs text-[#6B6B68]">
        Seus dados são usados só para contato sobre a avaliação do seu carro pela equipe AuToninho.
      </p>

      <button
        type="submit"
        disabled={pending || uploading}
        className="self-start rounded-lg bg-[#FF5A36] px-6 py-3 font-body text-sm font-bold text-white transition hover:bg-[#E14A28] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar solicitação"}
      </button>
    </form>
  )
}
