CREATE TYPE "public"."body_type" AS ENUM('hatch', 'sedan', 'suv', 'pickup', 'wagon');--> statement-breakpoint
CREATE TYPE "public"."car_event_type" AS ENUM('whatsapp_interest_click', 'visit_request_click', 'detail_view');--> statement-breakpoint
CREATE TYPE "public"."car_status" AS ENUM('draft', 'available', 'reserved', 'sold');--> statement-breakpoint
CREATE TYPE "public"."fuel" AS ENUM('flex', 'gasolina', 'diesel', 'eletrico', 'hibrido');--> statement-breakpoint
CREATE TYPE "public"."inspection_category" AS ENUM('motor_cambio', 'estrutura_lataria', 'pintura', 'pneus_rodas', 'eletrica', 'documentacao');--> statement-breakpoint
CREATE TYPE "public"."inspection_status" AS ENUM('aprovado', 'reparo_leve', 'atencao');--> statement-breakpoint
CREATE TYPE "public"."origin" AS ENUM('particular', 'leilao');--> statement-breakpoint
CREATE TYPE "public"."seller_submission_status" AS ENUM('novo', 'em_analise', 'proposta_enviada', 'recusado', 'comprado');--> statement-breakpoint
CREATE TYPE "public"."transmission" AS ENUM('manual', 'automatic');--> statement-breakpoint
CREATE TABLE "car_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"type" "car_event_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "car_history" (
	"car_id" uuid PRIMARY KEY NOT NULL,
	"previous_owners_count" smallint NOT NULL,
	"had_accident_record" boolean NOT NULL,
	"dealer_serviced_until_year" smallint,
	"inspected_by_team" boolean DEFAULT true NOT NULL,
	"additional_notes" text
);
--> statement-breakpoint
CREATE TABLE "car_inspection_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"category" "inspection_category" NOT NULL,
	"status" "inspection_status" NOT NULL,
	"note" text,
	CONSTRAINT "car_inspection_items_car_category_unique" UNIQUE("car_id","category")
);
--> statement-breakpoint
CREATE TABLE "car_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"url" text NOT NULL,
	"position" smallint NOT NULL,
	"is_cover" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"body_type" "body_type" NOT NULL,
	"year_fab" smallint NOT NULL,
	"year_model" smallint NOT NULL,
	"km" integer NOT NULL,
	"transmission" "transmission" NOT NULL,
	"fuel" "fuel" NOT NULL,
	"color" text NOT NULL,
	"armored" boolean DEFAULT false NOT NULL,
	"has_spare_key" boolean DEFAULT true NOT NULL,
	"origin" "origin" NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"market_value" numeric(12, 2),
	"doc_transfer_days" smallint,
	"city" text NOT NULL,
	"state" varchar(2) NOT NULL,
	"status" "car_status" DEFAULT 'draft' NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"description" text,
	"sold_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cars_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "seller_submission_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"url" text NOT NULL,
	"position" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seller_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"year" smallint NOT NULL,
	"km" integer NOT NULL,
	"transmission" "transmission",
	"color" text,
	"condition_notes" text,
	"seller_name" text NOT NULL,
	"seller_phone" text NOT NULL,
	"seller_city" text,
	"status" "seller_submission_status" DEFAULT 'novo' NOT NULL,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"store_name" text NOT NULL,
	"whatsapp_number" text NOT NULL,
	"address_street" text NOT NULL,
	"address_neighborhood" text,
	"city" text NOT NULL,
	"state" varchar(2) NOT NULL,
	"zip_code" text NOT NULL,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	CONSTRAINT "site_settings_singleton" CHECK ("site_settings"."id" = 1)
);
--> statement-breakpoint
ALTER TABLE "car_events" ADD CONSTRAINT "car_events_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_history" ADD CONSTRAINT "car_history_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_inspection_items" ADD CONSTRAINT "car_inspection_items_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_photos" ADD CONSTRAINT "car_photos_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_submission_photos" ADD CONSTRAINT "seller_submission_photos_submission_id_seller_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."seller_submissions"("id") ON DELETE cascade ON UPDATE no action;