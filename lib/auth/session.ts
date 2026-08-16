export const SESSION_COOKIE_NAME = "autoninho_admin_session"
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7 // 7 dias

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não configurada.`)
  }
  return value
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=")
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes as Uint8Array<ArrayBuffer>
}

async function getSigningKey(): Promise<CryptoKey> {
  const secret = requireEnv("ADMIN_SESSION_SECRET")
  return crypto.subtle.importKey("raw", textEncoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ])
}

/** Token = base64url(payload).base64url(assinatura HMAC-SHA256 do payload). */
export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({ iat: Date.now(), exp: Date.now() + SESSION_DURATION_MS })
  const payloadB64 = toBase64Url(textEncoder.encode(payload))
  const key = await getSigningKey()
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payloadB64))
  return `${payloadB64}.${toBase64Url(new Uint8Array(signature))}`
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const [payloadB64, signatureB64] = token.split(".")
  if (!payloadB64 || !signatureB64) return false

  const key = await getSigningKey()
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    fromBase64Url(signatureB64),
    textEncoder.encode(payloadB64)
  )
  if (!isValid) return false

  try {
    const payload = JSON.parse(textDecoder.decode(fromBase64Url(payloadB64))) as { exp?: number }
    return typeof payload.exp === "number" && payload.exp > Date.now()
  } catch {
    return false
  }
}

export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000
