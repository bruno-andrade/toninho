import { eq } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { siteSettings } from "@/lib/db/schema"

// Usado enquanto o Toninho ainda não cadastrou os dados reais em /admin/settings
// (ver docs/MVP_ROADMAP.md, Fase 3) — mesmos valores do protótipo original.
const FALLBACK_SETTINGS = {
  storeName: "AuToninho",
  whatsappNumber: "5582999999999",
  addressStreet: "Rua Doutor Augusto Cardoso",
  addressNeighborhood: "Jatiúca" as string | null,
  city: "Maceió",
  state: "AL",
  zipCode: "57035-590",
  latitude: null as string | null,
  longitude: null as string | null,
}

export type SiteSettings = typeof FALLBACK_SETTINGS

export async function getSiteSettings(): Promise<SiteSettings> {
  const [row] = await getDb().select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1)
  if (!row) return FALLBACK_SETTINGS
  return {
    storeName: row.storeName,
    whatsappNumber: row.whatsappNumber,
    addressStreet: row.addressStreet,
    addressNeighborhood: row.addressNeighborhood,
    city: row.city,
    state: row.state,
    zipCode: row.zipCode,
    latitude: row.latitude,
    longitude: row.longitude,
  }
}

export function buildWhatsappUrl(whatsappNumber: string, message: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}
