"use client"

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react"

const STORAGE_KEY = "autoninho_favorites"
const LOCAL_CHANGE_EVENT = "autoninho-favorites-changed"

function readRaw(): string {
  if (typeof window === "undefined") return "{}"
  return window.localStorage.getItem(STORAGE_KEY) ?? "{}"
}

function getServerSnapshot(): string {
  return "{}"
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  window.addEventListener(LOCAL_CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(LOCAL_CHANGE_EVENT, callback)
  }
}

function parseFavorites(raw: string): Record<string, boolean> {
  try {
    return JSON.parse(raw) as Record<string, boolean>
  } catch {
    return {}
  }
}

type FavoritesContextValue = {
  favorites: Set<string>
  isFavorite: (carId: string) => boolean
  toggleFavorite: (carId: string) => void
  count: number
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore em vez de useEffect+setState: localStorage é uma store
  // externa de verdade, então isso evita o "setState síncrono num effect" e de
  // quebra sincroniza entre abas (evento "storage").
  const raw = useSyncExternalStore(subscribe, readRaw, getServerSnapshot)

  const favorites = useMemo(() => {
    const parsed = parseFavorites(raw)
    return new Set(Object.keys(parsed).filter((id) => parsed[id]))
  }, [raw])

  const toggleFavorite = useCallback((carId: string) => {
    const current = parseFavorites(readRaw())
    if (current[carId]) delete current[carId]
    else current[carId] = true
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    } catch {
      // localStorage indisponível (modo privado etc.) — favoritos não persistem, mas a UI não quebra.
    }
    window.dispatchEvent(new Event(LOCAL_CHANGE_EVENT))
  }, [])

  const isFavorite = useCallback((carId: string) => favorites.has(carId), [favorites])

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, count: favorites.size }),
    [favorites, isFavorite, toggleFavorite]
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error("useFavorites precisa estar dentro de <FavoritesProvider>")
  return ctx
}
