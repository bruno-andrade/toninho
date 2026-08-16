import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { eq } from "drizzle-orm"
import { type NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session"
import { getDb } from "@/lib/db/client"
import { cars } from "@/lib/db/schema"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = clientPayload ? (JSON.parse(clientPayload) as { carId?: string }) : {}
        const carId = payload.carId
        if (!carId || !pathname.startsWith(`cars/${carId}/`)) {
          throw new Error("Solicitação de upload inválida.")
        }

        const [car] = await getDb()
          .select({ id: cars.id, archived: cars.archived })
          .from(cars)
          .where(eq(cars.id, carId))
          .limit(1)
        if (!car || car.archived) {
          throw new Error("Carro não encontrado.")
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 8 * 1024 * 1024,
          tokenPayload: JSON.stringify({ carId }),
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro desconhecido." }, { status: 400 })
  }
}
