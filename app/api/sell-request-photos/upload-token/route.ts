import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse, type NextRequest } from "next/server"
import { getClientIp, isRateLimited } from "@/lib/site/rate-limit"

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (isRateLimited(`sell-upload:${getClientIp(request)}`, 30, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas, tente novamente em instantes." }, { status: 429 })
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("sell-requests/")) {
          throw new Error("Solicitação de upload inválida.")
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 8 * 1024 * 1024,
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro desconhecido." }, { status: 400 })
  }
}
