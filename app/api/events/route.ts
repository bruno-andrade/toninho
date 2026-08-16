import { eq } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { getDb } from "@/lib/db/client"
import { carEvents, cars } from "@/lib/db/schema"
import { getClientIp, isRateLimited } from "@/lib/site/rate-limit"

const EVENT_TYPES = ["whatsapp_interest_click", "visit_request_click", "detail_view"] as const

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (isRateLimited(`events:${getClientIp(request)}`, 30, 60_000)) {
    return new NextResponse(null, { status: 204 })
  }

  let body: { carId?: string; type?: string }
  try {
    body = await request.json()
  } catch {
    return new NextResponse(null, { status: 204 })
  }

  const { carId, type } = body
  if (!carId || !EVENT_TYPES.includes(type as (typeof EVENT_TYPES)[number])) {
    return new NextResponse(null, { status: 204 })
  }

  try {
    const db = getDb()
    const [car] = await db.select({ id: cars.id }).from(cars).where(eq(cars.id, carId)).limit(1)
    if (car) {
      await db.insert(carEvents).values({ carId, type: type as (typeof EVENT_TYPES)[number] })
    }
  } catch {
    // fire-and-forget — nunca expor erro de tracking ao visitante público
  }

  return new NextResponse(null, { status: 204 })
}
