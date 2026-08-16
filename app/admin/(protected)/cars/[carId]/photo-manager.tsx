"use client"

import { upload } from "@vercel/blob/client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"
import type { carPhotos } from "@/lib/db/schema"
import { attachCarPhotoAction, deleteCarPhotoAction, reorderCarPhotosAction, setCoverPhotoAction } from "./photo-actions"

type Photo = typeof carPhotos.$inferSelect

export function PhotoManager({ carId, photos }: { carId: string; photos: Photo[] }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setUploading(true)
    setError(null)

    try {
      for (const file of Array.from(fileList)) {
        const pathname = `cars/${carId}/${crypto.randomUUID()}-${file.name}`
        const blob = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: "/api/car-photos/upload-token",
          clientPayload: JSON.stringify({ carId }),
        })
        const result = await attachCarPhotoAction(carId, blob.url)
        if (!result.ok) setError(result.error.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar foto.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
      router.refresh()
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= photos.length) return
    const next = [...photos]
    ;[next[index], next[target]] = [next[target], next[index]]
    setError(null)
    startTransition(async () => {
      const result = await reorderCarPhotosAction(
        carId,
        next.map((photo) => photo.id)
      )
      if (!result.ok) setError(result.error.message)
      router.refresh()
    })
  }

  function makeCover(photoId: string) {
    setError(null)
    startTransition(async () => {
      const result = await setCoverPhotoAction(carId, photoId)
      if (!result.ok) setError(result.error.message)
      router.refresh()
    })
  }

  function remove(photoId: string) {
    setError(null)
    startTransition(async () => {
      const result = await deleteCarPhotoAction(photoId)
      if (!result.ok) setError(result.error.message)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="inline-block cursor-pointer rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500">
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
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </div>

      {photos.length === 0 ? (
        <p className="text-sm text-neutral-400">Nenhuma foto ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="flex flex-col gap-2 rounded-xl border border-neutral-800 p-2">
              <div className="relative h-32 w-full overflow-hidden rounded-lg bg-neutral-800">
                <Image src={photo.url} alt="" fill sizes="200px" className="object-cover" />
                {photo.isCover ? (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    Capa
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-1 text-xs">
                <button
                  type="button"
                  disabled={isPending || index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded px-1.5 py-1 text-neutral-400 hover:bg-neutral-800 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={isPending || index === photos.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded px-1.5 py-1 text-neutral-400 hover:bg-neutral-800 disabled:opacity-30"
                >
                  ↓
                </button>
                {!photo.isCover ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => makeCover(photo.id)}
                    className="rounded px-1.5 py-1 text-neutral-400 hover:bg-neutral-800"
                  >
                    Definir capa
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => remove(photo.id)}
                  className="rounded px-1.5 py-1 text-red-400 hover:bg-neutral-800"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
