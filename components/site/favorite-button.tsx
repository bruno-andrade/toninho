"use client"

import { useFavorites } from "./favorites-provider"

export function FavoriteButton({ carId, size = 16 }: { carId: string; size?: number }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(carId)

  return (
    <button
      type="button"
      aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={favorited}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleFavorite(carId)
      }}
      style={{ color: favorited ? "#C93A1A" : "#6B6B68", fontSize: size }}
      className="flex h-6 w-6 cursor-pointer items-center justify-center leading-none"
    >
      {favorited ? "♥" : "♡"}
    </button>
  )
}
