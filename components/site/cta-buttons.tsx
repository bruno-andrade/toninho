"use client"

import { trackEvent } from "@/lib/site/track-event"

export function WhatsappInterestButton({ carId, href }: { carId: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      onClick={() => trackEvent(carId, "whatsapp_interest_click")}
      className="rounded-lg bg-[#C93A1A] py-3 text-center font-body text-sm font-bold text-white transition hover:bg-[#B83318]"
    >
      Tenho interesse pelo WhatsApp
    </a>
  )
}

export function ScheduleVisitButton({ carId, href }: { carId: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      onClick={() => trackEvent(carId, "visit_request_click")}
      className="rounded-lg border border-[#E6E4DF] py-3 text-center font-body text-sm font-bold text-[#1A1A1A] transition hover:border-[#1A1A1A]"
    >
      Agendar visita
    </a>
  )
}
