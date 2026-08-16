"use client"

import { useEffect } from "react"
import { trackEvent } from "@/lib/site/track-event"

export function DetailViewTracker({ carId }: { carId: string }) {
  useEffect(() => {
    trackEvent(carId, "detail_view")
  }, [carId])
  return null
}
