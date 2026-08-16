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
      style={{ fontSize: size, color: favorited ? "#FF5A36" : "#A8A59C" }}
      className="cursor-pointer leading-none"
    >
      {favorited ? "♥" : "♡"}
    </button>
  )
}
