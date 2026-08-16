/**
 * Ainda não temos domínio próprio (docs/MVP_ROADMAP.md, Fase 4) — usa
 * NEXT_PUBLIC_SITE_URL se definida, senão a URL de produção/preview da
 * própria Vercel, senão localhost em dev.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}
