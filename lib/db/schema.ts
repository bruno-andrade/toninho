import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  integer,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

export const bodyTypeEnum = pgEnum("body_type", ["hatch", "sedan", "suv", "pickup", "wagon"])
export const transmissionEnum = pgEnum("transmission", ["manual", "automatic"])
export const fuelEnum = pgEnum("fuel", ["flex", "gasolina", "diesel", "eletrico", "hibrido"])
export const originEnum = pgEnum("origin", ["particular", "leilao"])
export const carStatusEnum = pgEnum("car_status", ["draft", "available", "reserved", "sold"])
export const inspectionCategoryEnum = pgEnum("inspection_category", [
  "motor_cambio",
  "estrutura_lataria",
  "pintura",
  "pneus_rodas",
  "eletrica",
  "documentacao",
])
export const inspectionStatusEnum = pgEnum("inspection_status", ["aprovado", "reparo_leve", "atencao"])
export const carEventTypeEnum = pgEnum("car_event_type", [
  "whatsapp_interest_click",
  "visit_request_click",
  "detail_view",
])
export const sellerSubmissionStatusEnum = pgEnum("seller_submission_status", [
  "novo",
  "em_analise",
  "proposta_enviada",
  "recusado",
  "comprado",
])

// docs/DATA_MODEL.md #2 — anúncio de carro
export const cars = pgTable("cars", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  bodyType: bodyTypeEnum("body_type").notNull(),
  yearFab: smallint("year_fab").notNull(),
  yearModel: smallint("year_model").notNull(),
  km: integer("km").notNull(),
  transmission: transmissionEnum("transmission").notNull(),
  fuel: fuelEnum("fuel").notNull(),
  color: text("color").notNull(),
  armored: boolean("armored").notNull().default(false),
  hasSpareKey: boolean("has_spare_key").notNull().default(true),
  origin: originEnum("origin").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  marketValue: numeric("market_value", { precision: 12, scale: 2 }),
  docTransferDays: smallint("doc_transfer_days"),
  city: text("city").notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  status: carStatusEnum("status").notNull().default("draft"),
  archived: boolean("archived").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  description: text("description"),
  soldAt: timestamp("sold_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

// docs/DATA_MODEL.md #3 — fotos do anúncio
export const carPhotos = pgTable("car_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  carId: uuid("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  position: smallint("position").notNull(),
  isCover: boolean("is_cover").notNull().default(false),
})

// docs/DATA_MODEL.md #4 — laudo de inspeção (6 categorias fixas)
export const carInspectionItems = pgTable(
  "car_inspection_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    carId: uuid("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    category: inspectionCategoryEnum("category").notNull(),
    status: inspectionStatusEnum("status").notNull(),
    note: text("note"),
  },
  (table) => [unique("car_inspection_items_car_category_unique").on(table.carId, table.category)]
)

// docs/DATA_MODEL.md #5 — histórico do veículo (1:1 com cars)
export const carHistory = pgTable("car_history", {
  carId: uuid("car_id")
    .primaryKey()
    .references(() => cars.id, { onDelete: "cascade" }),
  previousOwnersCount: smallint("previous_owners_count").notNull(),
  hadAccidentRecord: boolean("had_accident_record").notNull(),
  dealerServicedUntilYear: smallint("dealer_serviced_until_year"),
  inspectedByTeam: boolean("inspected_by_team").notNull().default(true),
  additionalNotes: text("additional_notes"),
})

// docs/DATA_MODEL.md #6 — eventos de interesse (métricas do dashboard)
export const carEvents = pgTable("car_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  carId: uuid("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  type: carEventTypeEnum("type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

// docs/DATA_MODEL.md #7 — solicitações de "Vender meu carro"
export const sellerSubmissions = pgTable("seller_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: smallint("year").notNull(),
  km: integer("km").notNull(),
  transmission: transmissionEnum("transmission"),
  color: text("color"),
  conditionNotes: text("condition_notes"),
  sellerName: text("seller_name").notNull(),
  sellerPhone: text("seller_phone").notNull(),
  sellerCity: text("seller_city"),
  status: sellerSubmissionStatusEnum("status").notNull().default("novo"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

// docs/DATA_MODEL.md #8
export const sellerSubmissionPhotos = pgTable("seller_submission_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => sellerSubmissions.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  position: smallint("position").notNull(),
})

// docs/DATA_MODEL.md #9 — configurações da loja (singleton, id fixo = 1)
export const siteSettings = pgTable(
  "site_settings",
  {
    id: integer("id").primaryKey().default(1),
    storeName: text("store_name").notNull(),
    whatsappNumber: text("whatsapp_number").notNull(),
    addressStreet: text("address_street").notNull(),
    addressNeighborhood: text("address_neighborhood"),
    city: text("city").notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    zipCode: text("zip_code").notNull(),
    latitude: numeric("latitude", { precision: 9, scale: 6 }),
    longitude: numeric("longitude", { precision: 9, scale: 6 }),
  },
  (table) => [check("site_settings_singleton", sql`${table.id} = 1`)]
)
