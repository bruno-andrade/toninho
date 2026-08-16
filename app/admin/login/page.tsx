import type { Metadata } from "next"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Login — Painel AuToninho",
  robots: { index: false, follow: false },
}

export default async function LoginPage(props: PageProps<"/admin/login">) {
  const searchParams = await props.searchParams
  const nextParam = searchParams.next
  const nextPath = typeof nextParam === "string" && nextParam.startsWith("/admin") ? nextParam : "/admin"

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl shadow-black/40">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500">AuToninho</p>
          <h1 className="mt-1 text-xl font-bold text-white">Painel administrativo</h1>
        </div>
        <LoginForm nextPath={nextPath} />
      </div>
    </main>
  )
}
