import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dbCredentials: {
    // Migrations precisam de conexão direta (não pooled) — ver
    // docs/DATA_MODEL.md e o skill .agents/skills/neon-postgres/SKILL.md.
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
})
