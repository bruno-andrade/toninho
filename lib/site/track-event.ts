export type CarEventType = "whatsapp_interest_click" | "visit_request_click" | "detail_view"

export function trackEvent(carId: string, type: CarEventType) {
  if (typeof window === "undefined") return
  const payload = JSON.stringify({ carId, type })
  try {
    const sent = navigator.sendBeacon ? navigator.sendBeacon("/api/events", payload) : false
    if (!sent) {
      fetch("/api/events", {
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    // tracking nunca deve quebrar a navegação do usuário
  }
}
