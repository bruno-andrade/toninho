import type { Metadata } from "next"
import { eq } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { siteSettings } from "@/lib/db/schema"
import { SettingsForm } from "./settings-form"

export const metadata: Metadata = { title: "Configurações" }
export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const [settings] = await getDb().select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1)

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Configurações da loja</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Número de WhatsApp e endereço usados no site público — editáveis aqui, sem precisar de deploy.
        </p>
      </header>
      <SettingsForm defaultValues={settings} />
    </div>
  )
}
