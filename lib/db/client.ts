import { attachDatabasePool } from "@vercel/functions"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

// Lazy singleton: evita abrir conexão durante `next build` (páginas estáticas
// importam este módulo sem necessariamente executar uma query) e garante que,
// em Fluid Compute, a pool seja reaproveitada entre invocações da mesma instância.
let db: ReturnType<typeof drizzle<typeof schema>> | undefined

export function getDb() {
  if (!db) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      min: 1,
      max: 10,
      idleTimeoutMillis: 5000,
    })
    attachDatabasePool(pool)
    db = drizzle(pool, { schema })
  }
  return db
}
