import type { Metadata } from "next"
import { asc, eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { getDb } from "@/lib/db/client"
import { carHistory, carInspectionItems, carPhotos, cars } from "@/lib/db/schema"
import { CarEditTabs } from "./car-edit-tabs"

export const metadata: Metadata = { title: "Editar carro" }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function EditCarPage(props: PageProps<"/admin/cars/[carId]">) {
  const { carId } = await props.params
  if (!UUID_RE.test(carId)) notFound()

  const db = getDb()
  const [[car], photos, inspectionItems, historyRows] = await Promise.all([
    db.select().from(cars).where(eq(cars.id, carId)).limit(1),
    db.select().from(carPhotos).where(eq(carPhotos.carId, carId)).orderBy(asc(carPhotos.position)),
    db.select().from(carInspectionItems).where(eq(carInspectionItems.carId, carId)),
    db.select().from(carHistory).where(eq(carHistory.carId, carId)).limit(1),
  ])
  if (!car) notFound()

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-white">
          {car.brand} {car.model}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">{car.slug}</p>
      </header>

      <CarEditTabs car={car} photos={photos} inspectionItems={inspectionItems} history={historyRows[0] ?? null} />
    </div>
  )
}
