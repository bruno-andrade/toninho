import { and, eq, inArray } from "drizzle-orm"
import type { MetadataRoute } from "next"
import { getDb } from "@/lib/db/client"
import { cars } from "@/lib/db/schema"
import { getBaseUrl } from "@/lib/site/base-url"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()

  const staticRoutes: MetadataRoute.Sitemap = ["/", "/busca", "/como-funciona", "/vender-meu-carro"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }))

  const publishedCars = await getDb()
    .select({ slug: cars.slug, updatedAt: cars.updatedAt })
    .from(cars)
    .where(and(eq(cars.archived, false), inArray(cars.status, ["available", "reserved", "sold"])))

  const carRoutes: MetadataRoute.Sitemap = publishedCars.map((car) => ({
    url: `${baseUrl}/carro/${car.slug}`,
    lastModified: car.updatedAt,
  }))

  return [...staticRoutes, ...carRoutes]
}
