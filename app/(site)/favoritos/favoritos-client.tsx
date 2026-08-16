"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CarCardWide } from "@/components/site/car-card"
import { useFavorites } from "@/components/site/favorites-provider"
import { getFavoriteCarsAction } from "@/lib/site/actions"
import type { cars } from "@/lib/db/schema"

type Car = typeof cars.$inferSelect
type Result = { key: string; cars: Car[]; coverByCarId: Record<string, string | null> }

export function FavoritosClient() {
  const { favorites } = useFavorites()
  const favoritesKey = Array.from(favorites).sort().join(",")
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    let cancelled = false
    getFavoriteCarsAction(Array.from(favorites)).then((data) => {
      if (cancelled) return
      setResult({ key: favoritesKey, ...data })
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- favoritesKey já deriva de favorites
  }, [favoritesKey])

  const loading = result?.key !== favoritesKey
  if (loading) return null

  if (result.cars.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2.5 px-5 py-16 text-center">
        <span className="text-4xl text-[#E6E4DF]">♡</span>
        <span className="font-heading text-base font-bold text-[#1A1A1A]">
          Você ainda não favoritou nenhum carro
        </span>
        <span className="font-body text-[13px] text-[#6B6B68]">
          Clique no coração nos anúncios para salvar aqui.
        </span>
        <Link
          href="/busca"
          className="mt-2 rounded-lg bg-[#C93A1A] px-5 py-2.5 font-body text-[13px] font-bold text-white"
        >
          Ver carros
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {result.cars.map((car) => (
        <CarCardWide key={car.id} car={car} coverUrl={result.coverByCarId[car.id] ?? null} />
      ))}
    </div>
  )
}
