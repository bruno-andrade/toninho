# Modelo de dados — Painel administrativo AuToninho

Complementa o [PRD.md](./PRD.md). Cobre as entidades do banco de dados necessárias para o site público e o painel administrativo (seção 7 e 5.7 do PRD).

Decisões confirmadas com o responsável do produto, refletidas neste modelo:
- **Agendar visita** é só um CTA de WhatsApp (mensagem pré-preenchida) — não vira registro no banco.
- Carro **reservado/vendido continua visível na vitrine pública**, com selo — não é ocultado.
- Painel admin usa **um login único compartilhado** — não há tabela de usuários/papéis no MVP.
- Eventos de interesse (clique em "Tenho interesse", "Agendar visita") **são guardados no banco** para métricas internas.

---

## 1. Visão geral das entidades

```
site_settings (singleton)        cars ──< car_photos
                                   │  ──< car_inspection_items
                                   │  ──< car_history (1:1)
                                   │  ──< car_events

seller_submissions ──< seller_submission_photos
```

- `cars`, `car_photos`, `car_inspection_items`, `car_history` e `car_events` giram em torno do anúncio de carro.
- `seller_submissions` e `seller_submission_photos` são independentes — vêm do formulário "Vender meu carro".
- `site_settings` é uma tabela de uma linha só, editável no painel, para dados que hoje são placeholder no protótipo (WhatsApp, endereço da loja).
- **Não há tabela de usuários admin** no MVP: autenticação por senha única via variável de ambiente (ex. `ADMIN_PASSWORD`) + sessão/cookie. Evolução para múltiplos usuários fica documentada como próximo passo, sem afetar as tabelas acima.
- **Não há tabela de favoritos**: continuam só no `localStorage` do navegador, conforme já decidido no PRD.

---

## 2. `cars` — Anúncio de carro

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid (PK) | |
| `slug` | text, único | URL amigável, ex. `toyota-corolla-xei-2020-a1b2` |
| `brand` | text | Ex. "Toyota" |
| `model` | text | Ex. "Corolla XEi 2.0" |
| `body_type` | enum `body_type` | `hatch` \| `sedan` \| `suv` \| `pickup` \| `wagon` |
| `year_fab` | smallint | Ano de fabricação |
| `year_model` | smallint | Ano do modelo (protótipo mostra "2020/2020") |
| `km` | integer | |
| `transmission` | enum `transmission` | `manual` \| `automatic` |
| `fuel` | enum `fuel` | `flex` \| `gasolina` \| `diesel` \| `eletrico` \| `hibrido` |
| `color` | text | |
| `armored` | boolean | Blindagem — default `false` |
| `has_spare_key` | boolean | "Possui chave" no protótipo |
| `origin` | enum `origin` | `particular` \| `leilao` |
| `price` | numeric(12,2) | Preço à vista |
| `market_value` | numeric(12,2), nullable | Referência tipo Fipe — editável manualmente pelo admin |
| `doc_transfer_days` | smallint, nullable | Prazo estimado de documentação (protótipo: 30) |
| `city` | text | |
| `state` | char(2) | UF |
| `status` | enum `car_status` | `draft` \| `available` \| `reserved` \| `sold` |
| `archived` | boolean | Default `false`. Painel admin não tem exclusão definitiva — "remover" um carro é marcar `archived = true`, que some da vitrine pública independente do `status` |
| `featured` | boolean | Aparece em "Carros em destaque" na Home — default `false` |
| `description` | text, nullable | Observações livres, opcional |
| `sold_at` | timestamptz, nullable | Preenchido quando `status` vira `sold` — base para métrica "dias até vender" |
| `created_at` / `updated_at` | timestamptz | |

**Regras de negócio:**
- Todo carro é criado com `status = draft` e só passa a `available` através da ação de publicar, que valida que existe pelo menos uma foto de capa e um preço definido.
- `available`, `reserved` e `sold` aparecem na Listagem/Home pública, com badge correspondente, **desde que `archived = false`**. `draft` nunca aparece publicamente, independente de `archived`.
- Apenas o filtro "Ordenar/Status" pode permitir esconder vendidos, mas o default é mostrar todos (prova social de estoque girando).
- Não há exclusão definitiva de carro no painel admin: o botão "Remover" marca `archived = true` (some da vitrine, mantém histórico e métricas em `car_events`).
- `slug` gerado a partir de marca + modelo + ano + sufixo curto aleatório, para evitar colisão.
- `featured`: alternativa mais simples a considerar depois — derivar "destaque" automaticamente (ex. mais recentes) em vez de campo manual; mantido como boolean editável por ora porque dá controle direto ao Toninho.

---

## 3. `car_photos` — Fotos do anúncio

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid (PK) | |
| `car_id` | uuid (FK → `cars.id`, cascade delete) | |
| `url` | text | URL no storage de imagens (ex. Vercel Blob) |
| `position` | smallint | Ordem de exibição na galeria |
| `is_cover` | boolean | Foto usada nos cards/listagem — só uma `true` por carro |

---

## 4. `car_inspection_items` — Laudo de inspeção

Categorias fixas, iguais às do protótipo (evolução futura: se o Toninho quiser adicionar categorias sem depender de deploy, isso vira uma tabela `inspection_categories` configurável — não necessário para o MVP).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid (PK) | |
| `car_id` | uuid (FK → `cars.id`, cascade delete) | |
| `category` | enum `inspection_category` | `motor_cambio` \| `estrutura_lataria` \| `pintura` \| `pneus_rodas` \| `eletrica` \| `documentacao` |
| `status` | enum `inspection_status` | `aprovado` \| `reparo_leve` \| `atencao` |
| `note` | text, nullable | Ex. "Repar. leve" no protótipo, com detalhe opcional |

Restrição: par único (`car_id`, `category`) — um carro tem no máximo um registro por categoria.

---

## 5. `car_history` — Histórico do veículo

Relação 1:1 com `cars` (campos estruturados em vez de lista livre, para consistência e futura filtragem, ex. "só carros sem sinistro"):

| Campo | Tipo | Notas |
|---|---|---|
| `car_id` | uuid (PK, FK → `cars.id`) | |
| `previous_owners_count` | smallint | Ex. 1 |
| `had_accident_record` | boolean | "Sem registro de sinistro" no protótipo |
| `dealer_serviced_until_year` | smallint, nullable | "Revisões em concessionária até 2023" |
| `inspected_by_team` | boolean | Default `true` — todo carro AuToninho passa pela inspeção |
| `additional_notes` | text, nullable | Qualquer observação extra não coberta pelos campos acima |

---

## 6. `car_events` — Eventos de interesse (métricas)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid (PK) | |
| `car_id` | uuid (FK → `cars.id`, cascade delete) | |
| `type` | enum `car_event_type` | `whatsapp_interest_click` \| `visit_request_click` \| `detail_view` |
| `created_at` | timestamptz | |

**Uso no painel admin:** relatórios simples tipo "carro mais clicado no mês", "cliques em WhatsApp por carro", alimentando as métricas da seção 2 do PRD. Sem necessidade de tabela de sessão/usuário — eventos são anônimos (compatível com "sem login" no site público).

---

## 7. `seller_submissions` — Solicitações de "Vender meu carro"

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid (PK) | |
| `brand` | text | Informado pelo vendedor |
| `model` | text | |
| `year` | smallint | |
| `km` | integer | |
| `transmission` | enum `transmission`, nullable | Reaproveita o mesmo enum de `cars` |
| `color` | text, nullable | |
| `condition_notes` | text, nullable | Estado de conservação, sinistro/pendência relatados pelo vendedor |
| `seller_name` | text | |
| `seller_phone` | text | |
| `seller_city` | text, nullable | |
| `status` | enum `seller_submission_status` | `novo` \| `em_analise` \| `proposta_enviada` \| `recusado` \| `comprado` |
| `internal_notes` | text, nullable | Anotações da equipe, não visíveis ao vendedor |
| `created_at` / `updated_at` | timestamptz | |

**Regra de negócio:** sem exclusão definitiva no painel — `recusado` e `comprado` já funcionam como estados finais/"arquivados" da solicitação, preservando o histórico.

## 8. `seller_submission_photos`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid (PK) | |
| `submission_id` | uuid (FK → `seller_submissions.id`, cascade delete) | |
| `url` | text | |
| `position` | smallint | |

---

## 9. `site_settings` — Configurações da loja (singleton)

Tabela de **uma única linha** (ou `id` fixo = 1), editável no painel admin — resolve diretamente os placeholders sinalizados como risco no PRD (número de WhatsApp e endereço), sem precisar de deploy para corrigir.

| Campo | Tipo | Notas |
|---|---|---|
| `store_name` | text | Ex. "Loja AuToninho Maceió" |
| `whatsapp_number` | text | Formato internacional, ex. `5582999999999` |
| `address_street` | text | |
| `address_neighborhood` | text | Ex. "Jatiúca" |
| `city` | text | |
| `state` | char(2) | |
| `zip_code` | text | |
| `latitude` / `longitude` | numeric, nullable | Para o embed do mapa |

---

## 10. Resumo dos enums

| Enum | Valores |
|---|---|
| `body_type` | `hatch`, `sedan`, `suv`, `pickup`, `wagon` |
| `transmission` | `manual`, `automatic` |
| `fuel` | `flex`, `gasolina`, `diesel`, `eletrico`, `hibrido` |
| `origin` | `particular`, `leilao` |
| `car_status` | `draft`, `available`, `reserved`, `sold` |
| `inspection_category` | `motor_cambio`, `estrutura_lataria`, `pintura`, `pneus_rodas`, `eletrica`, `documentacao` |
| `inspection_status` | `aprovado`, `reparo_leve`, `atencao` |
| `car_event_type` | `whatsapp_interest_click`, `visit_request_click`, `detail_view` |
| `seller_submission_status` | `novo`, `em_analise`, `proposta_enviada`, `recusado`, `comprado` |

---

## 11. Fora do modelo (por decisão já tomada)

- **Usuários/papéis do admin**: login único via variável de ambiente, sem tabela. Se a equipe crescer, adicionar depois uma tabela `admin_users` (email, senha hash, papel) sem impacto nas tabelas acima.
- **Favoritos**: só no `localStorage` do navegador — nenhuma tabela no servidor.
- **Agendamento de visita**: sem tabela — é só um link de WhatsApp com mensagem diferente da de "interesse" (pode reaproveitar `car_events.type = visit_request_click` para saber que o clique aconteceu, mesmo sem guardar data/hora).
- **Financiamento/pagamento online**: fora de escopo do MVP (ver PRD), não há tabelas de transação/pagamento.

---

## 12. Próximos passos técnicos sugeridos

**Atualização:** Neon Postgres (plano Free, via Vercel Marketplace) e Vercel Blob (store `autoninho-photos`, acesso público) já estão provisionados e conectados ao projeto — `DATABASE_URL` e `BLOB_READ_WRITE_TOKEN` disponíveis via `vercel env pull`. Os passos abaixo continuam pendentes:

1. Escolher ORM/ferramenta de schema (ex. Drizzle ou Prisma) e escrever as migrations deste modelo no banco Neon já criado.
2. Definir contrato de upload de fotos (assinatura de URL para Vercel Blob) usado tanto por `car_photos` quanto por `seller_submission_photos`.
3. Definir os campos exatos do formulário de admin (CRUD de `cars`) e do formulário público de "Vender meu carro", 1:1 com as tabelas acima.
