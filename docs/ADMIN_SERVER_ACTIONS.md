# Server actions e contratos — Painel administrativo AuToninho

Complementa [PRD.md](./PRD.md), [DATA_MODEL.md](./DATA_MODEL.md) e [ADMIN_ROUTES.md](./ADMIN_ROUTES.md). Detalha, por tela, quais mutações existem, o formato de entrada/saída e as regras de validação. Leituras (listas, detalhes) são feitas via Server Components direto na página, não via Server Action — só mutações viram Server Action.

Decisão confirmada nesta rodada: **carro novo nasce em `draft`** e só fica público pela ação `publishCar`, que valida foto de capa + preço.

---

## 0. Convenções

**Formato de retorno padrão** de toda Server Action:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } }
```

- `message` é sempre em pt-BR, pronta para mostrar ao admin.
- `fieldErrors` é preenchido quando a falha é de validação de formulário (chave = nome do campo).
- `code` é um identificador estável (`VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `MISSING_COVER_PHOTO`, etc.) para o front-end decidir comportamento sem parsear a mensagem.

**Autenticação**: toda action abaixo (exceto `login` e as do site público, marcadas explicitamente) revalida a sessão do cookie no próprio corpo da action — não confiar só no `middleware.ts`, já que Server Actions podem ser chamadas diretamente. Falha de sessão retorna `{ ok: false, error: { code: "UNAUTHORIZED", message: "Sessão expirada, faça login novamente." } }`.

**Validação**: todo input é validado com um schema (ex. Zod) colocado junto da action, antes de tocar no banco.

**IDs**: sempre `string` (uuid).

**Dinheiro**: os formulários trabalham com `number` em reais (ex. `68900.00`); a conversão para `numeric(12,2)` é responsabilidade da camada de persistência.

---

## 1. Autenticação

### `loginAction`

```ts
Input:  { password: string }
Output: ActionResult<{ redirectTo: string }>
```

- Compara `password` com `process.env.ADMIN_PASSWORD` (comparação de tempo constante).
- Sucesso: grava cookie de sessão assinado (httpOnly, secure, sameSite=lax, 7 dias), retorna `redirectTo` (rota `next` original ou `/admin`).
- Falha: `{ code: "INVALID_CREDENTIALS", message: "Senha incorreta." }` — mensagem genérica, sem indicar mais detalhes.
- Sem rate limit sofisticado no MVP; sugestão mínima: bloquear 30s após 5 tentativas falhas por IP.

### `logoutAction`

```ts
Input:  void
Output: ActionResult<void>
```

Limpa o cookie de sessão. Front-end redireciona para `/admin/login` após sucesso.

---

## 2. Carros — dados básicos e ciclo de vida

### `createCarAction` — usada em `/admin/cars/new`

```ts
Input: {
  brand: string
  model: string
  bodyType: "hatch" | "sedan" | "suv" | "pickup" | "wagon"
  yearFab: number
  yearModel: number
  km: number
  transmission: "manual" | "automatic"
  fuel: "flex" | "gasolina" | "diesel" | "eletrico" | "hibrido"
  color: string
  armored: boolean
  hasSpareKey: boolean
  origin: "particular" | "leilao"
  price: number
  marketValue?: number
  docTransferDays?: number
  city: string
  state: string        // UF, 2 letras
  featured?: boolean    // default false
}
Output: ActionResult<{ carId: string }>
```

- Validações: `price > 0`; `1990 <= yearFab, yearModel <= anoAtual + 1`; `km >= 0`; `state` com 2 letras maiúsculas; campos de texto não vazios.
- Sempre cria com `status: "draft"`, `archived: false`.
- Sucesso: front-end redireciona para `/admin/cars/{carId}` na aba Fotos.

### `updateCarBasicsAction` — usada em `/admin/cars/[carId]`, aba Dados básicos

```ts
Input: { carId: string } & Partial<CreateCarInput>   // mesmos campos de createCarAction, todos opcionais exceto carId
Output: ActionResult<void>
```

- Mesmas validações de `createCarAction` para os campos enviados.
- **Não altera `status`** — mudanças de status passam por `publishCarAction` / `setCarStatusAction` / `archiveCarAction`, para centralizar as regras de transição.
- Retorna `NOT_FOUND` se `carId` não existir.

### `publishCarAction`

```ts
Input:  { carId: string }
Output: ActionResult<void>
```

- Só permitido quando `status === "draft"`.
- Valida: existe ao menos 1 `car_photos` com `is_cover = true`; `price > 0`. Se faltar foto: `{ code: "MISSING_COVER_PHOTO", message: "Adicione ao menos uma foto de capa antes de publicar." }`.
- Sucesso: `status` → `available`.

### `setCarStatusAction` — usada no toggle rápido da lista e na edição

```ts
Input:  { carId: string; status: "available" | "reserved" | "sold" }
Output: ActionResult<void>
```

- Rejeita se o carro estiver em `draft` (precisa publicar antes) ou `archived = true`: `{ code: "INVALID_TRANSITION", message: "..." }`.
- Se `status === "sold"`: grava `sold_at = now()`.
- Se estava `sold` e volta para `available`/`reserved` (venda desfeita): limpa `sold_at = null`.

### `archiveCarAction`

```ts
Input:  { carId: string; archived: boolean }
Output: ActionResult<void>
```

- Alterna a flag `archived`. Usado tanto pelo botão "Remover" (`archived: true`) quanto por um eventual "Restaurar" (`archived: false`). Não existe ação de exclusão definitiva.

---

## 3. Fotos do carro

Upload de arquivo binário não é um bom fit para Server Action tradicional — usa-se o fluxo de **client upload do Vercel Blob**, que fala com um Route Handler, não com uma Server Action:

### `POST /api/car-photos/upload-token` (Route Handler, não Server Action)

- Implementa `handleUpload` do `@vercel/blob/client`.
- Corpo (enviado automaticamente pelo SDK do Blob): nome do arquivo + `clientPayload` contendo `{ carId }`.
- Antes de emitir o token, valida: sessão de admin ativa; carro `carId` existe e não está `archived`.
- Token de upload é escopado ao caminho `cars/{carId}/{uuid}-{fileName}`.
- Resposta: contrato padrão do `handleUpload` (token assinado que o SDK do Blob usa para subir o arquivo direto do navegador).

### `attachCarPhotoAction`

```ts
Input:  { carId: string; url: string }
Output: ActionResult<{ photoId: string }>
```

- Chamada pelo front-end depois que o upload no Blob terminou com sucesso.
- Cria linha em `car_photos` com `position = max(position deste carro) + 1`.
- Se for a primeira foto do carro, define `is_cover = true` automaticamente.

### `reorderCarPhotosAction`

```ts
Input:  { carId: string; orderedPhotoIds: string[] }
Output: ActionResult<void>
```

- Recalcula `position` de cada foto conforme a ordem do array (0, 1, 2, …). Rejeita se algum id não pertencer ao `carId`.

### `setCoverPhotoAction`

```ts
Input:  { carId: string; photoId: string }
Output: ActionResult<void>
```

- Transação: define `is_cover = true` na foto informada e `false` nas demais do mesmo carro.

### `deleteCarPhotoAction`

```ts
Input:  { photoId: string }
Output: ActionResult<void>
```

- Remove o arquivo do Blob (`del()`) e a linha em `car_photos`.
- Se a foto removida era a capa, promove automaticamente a próxima por `position` a `is_cover = true` (se existir alguma restante).

---

## 4. Laudo de inspeção

### `updateInspectionItemsAction` — salva a aba inteira de uma vez

```ts
Input: {
  carId: string
  items: Array<{
    category: "motor_cambio" | "estrutura_lataria" | "pintura" | "pneus_rodas" | "eletrica" | "documentacao"
    status: "aprovado" | "reparo_leve" | "atencao"
    note?: string
  }>   // as 6 categorias, sempre todas presentes no envio
}
Output: ActionResult<void>
```

- Upsert por `(carId, category)` — insere se não existir, atualiza se existir (restrição de unicidade já prevista no DATA_MODEL).
- Validação: `items` deve conter exatamente as 6 categorias fixas, sem duplicatas.

---

## 5. Histórico do veículo

### `updateCarHistoryAction`

```ts
Input: {
  carId: string
  previousOwnersCount: number
  hadAccidentRecord: boolean
  dealerServicedUntilYear?: number
  inspectedByTeam: boolean
  additionalNotes?: string
}
Output: ActionResult<void>
```

- Upsert (relação 1:1, `car_id` é chave primária de `car_history`).
- Validação: `previousOwnersCount >= 0`.

---

## 6. Solicitações de "Vender meu carro"

### `submitSellRequestAction` — pública (site, não painel)

```ts
Input: {
  brand: string
  model: string
  year: number
  km: number
  transmission?: "manual" | "automatic"
  color?: string
  conditionNotes?: string
  sellerName: string
  sellerPhone: string
  sellerCity?: string
  photoUrls: string[]   // já enviadas via client upload do Blob antes deste submit, path cars-vender/{uuid}
}
Output: ActionResult<{ submissionId: string }>
```

- **Sem autenticação** (formulário público).
- Rate limit por IP (ex. máx. 3 envios/hora) para conter spam.
- Cria `seller_submissions` com `status: "novo"` + linhas em `seller_submission_photos`.
- Validação: `sellerPhone` em formato válido de telefone BR; `photoUrls` com pelo menos 1 item (mínimo a confirmar com o Toninho na fase de UI).
- Notificação ao Toninho (e-mail/WhatsApp) sobre a nova solicitação: **fora do MVP** (mesmo tratamento do PRD) — por ora a equipe descobre novas solicitações olhando o Dashboard/lista no painel.

### `updateSellRequestStatusAction` — painel admin

```ts
Input:  { submissionId: string; status: "novo" | "em_analise" | "proposta_enviada" | "recusado" | "comprado"; internalNotes?: string }
Output: ActionResult<void>
```

- `internalNotes`, se enviado, substitui o valor atual (não é um log incremental no MVP — última nota escrita é a que vale).

### `createCarFromSellRequestAction` — painel admin

```ts
Input:  { submissionId: string }
Output: ActionResult<{ carId: string }>
```

- Só disponível quando `status === "comprado"` (validado na action, não só na UI).
- Cria um carro em `draft` pré-preenchido com `brand`, `model`, `year` → `yearFab`/`yearModel`, `km`, `transmission`, `color` da solicitação. Demais campos (preço, laudo, fotos definitivas) ficam para o admin completar no fluxo normal de `/admin/cars/[carId]`.
- Não copia `seller_submission_photos` para `car_photos` automaticamente — fotos do anúncio final tendem a ser refeitas pela loja.

---

## 7. Configurações da loja

### `updateSiteSettingsAction`

```ts
Input: {
  storeName: string
  whatsappNumber: string   // formato internacional, ex. "5582999999999"
  addressStreet: string
  addressNeighborhood: string
  city: string
  state: string
  zipCode: string
  latitude?: number
  longitude?: number
}
Output: ActionResult<void>
```

- Upsert na linha única de `site_settings`.
- Validação: `whatsappNumber` só dígitos, 12–13 caracteres (com DDI+DDD); `zipCode` em formato CEP.

---

## 8. Eventos públicos (alimentam o Dashboard)

### `POST /api/events` (Route Handler, público, sem autenticação)

```ts
Body:     { carId: string; type: "whatsapp_interest_click" | "visit_request_click" | "detail_view" }
Response: 204 No Content
```

- Fire-and-forget a partir do site público — o front-end não precisa aguardar/tratar resposta além de status.
- Rate limit por (IP + carId + type): no máximo 1 `detail_view` a cada 30s, para não inflar métricas em recarregamentos.
- Se `carId` não existir, responde `204` mesmo assim (não expõe erro ao visitante público) mas não grava nada.

---

## 9. Resumo de leituras (não são Server Actions)

Para completar o quadro — estas telas carregam dados direto via Server Component/query, sem passar por Server Action:

| Tela | Consulta |
|---|---|
| Dashboard | agregações em `cars` e `car_events` (contagens do mês corrente) + top 5 por cliques |
| Lista de carros | `cars` paginado, com filtro por `status`, `archived`, busca textual em `brand`/`model` |
| Editar carro | `cars` + `car_photos` + `car_inspection_items` + `car_history` pelo `carId` |
| Lista de solicitações | `seller_submissions` paginado, filtro por `status` |
| Detalhe da solicitação | `seller_submissions` + `seller_submission_photos` pelo `id` |
| Configurações | linha única de `site_settings` |

---

## 10. Próximos passos técnicos

**Atualização:** todas as server actions listadas neste documento já estão implementadas com Drizzle/Neon e verificadas de ponta a ponta (Playwright + inspeção direta do banco) — `createCarAction`, `updateCarBasicsAction`, `publishCarAction`, `setCarStatusAction`, `archiveCarAction`, as actions de fotos (`attachCarPhotoAction`, `setCoverPhotoAction`, `deleteCarPhotoAction`, `reorderCarPhotosAction`), `updateInspectionItemsAction`, `updateCarHistoryAction`, `updateSiteSettingsAction`, `submitSellRequestAction`, `updateSellRequestStatusAction` e `createCarFromSellRequestAction`. Os dois Route Handlers de upload (`/api/car-photos/upload-token` e `/api/sell-request-photos/upload-token`) e `POST /api/events` também existem, com rate limiting em memória. Resta:

1. Escolher a lib de schema/validação (ex. Zod) e escrever os schemas compartilhados entre client e server a partir dos contratos acima (hoje a validação é manual, por função).
2. Rate limiting em memória não é distribuído entre instâncias/regiões — considerar Upstash Redis (`@upstash/ratelimit`) se o volume justificar.
