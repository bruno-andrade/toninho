import type { Metadata } from "next"
import { SettingsForm } from "./settings-form"

export const metadata: Metadata = { title: "Configurações" }

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Configurações da loja</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Número de WhatsApp e endereço usados no site público — editáveis aqui, sem precisar de deploy.
        </p>
      </header>
      <SettingsForm />
    </div>
  )
}
