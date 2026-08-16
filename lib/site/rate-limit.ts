import type { NextRequest } from "next/server"

/**
 * Rate limit simples em memória, por instância. Não é distribuído entre
 * instâncias/regiões (precisaria de Upstash Redis pra isso) — suficiente
 * para o volume esperado do MVP, não para proteção contra abuso sério.
 */
const hits = new Map<string, number[]>()

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()
  return request.headers.get("x-real-ip") ?? "unknown"
}

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  const recent = (hits.get(key) ?? []).filter((timestamp) => timestamp > windowStart)
  recent.push(now)
  hits.set(key, recent)
  return recent.length > limit
}
