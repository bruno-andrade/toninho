"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session"

export type LoginState = {
  error?: string
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "")
  const nextPath = String(formData.get("next") ?? "/admin")

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { error: "Senha incorreta." }
  }

  const token = await createSessionToken()
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })

  redirect(nextPath.startsWith("/admin") ? nextPath : "/admin")
}
