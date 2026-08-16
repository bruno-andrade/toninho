# Rotas e telas — Painel administrativo AuToninho

Complementa o [PRD.md](./PRD.md) e o [DATA_MODEL.md](./DATA_MODEL.md). Define a estrutura de rotas (Next.js App Router) e o conteúdo de cada tela do painel `/admin`.

Decisões confirmadas nesta rodada, refletidas abaixo:
- Painel inclui uma **tela de Dashboard** simples com números operacionais (não é um analytics completo).
- **Sem exclusão definitiva**: carros usam a flag `archived`; solicitações de venda usam os status finais `recusado`/`comprado` (ver atualização em DATA_MODEL.md).
- Autenticação por **senha única compartilhada** (sem tabela de usuários).
- Carro novo nasce em **`draft`** e só fica público depois de uma ação explícita de **publicar** (ver seção 4.5 e 7, e SERVER_ACTIONS.md) — resolve o ponto em aberto que estava na seção 7.

---

## 1. Árvore de rotas

```
/admin/login                     — Login (única rota pública do painel)
/admin                           — Dashboard
/admin/cars                      — Lista de carros
/admin/cars/new                  — Novo carro (dados básicos)
/admin/cars/[carId]              — Editar carro (abas: dados, fotos, laudo, histórico)
/admin/sell-requests             — Lista de solicitações "Vender meu carro"
/admin/sell-requests/[id]        — Detalhe da solicitação
/admin/settings                  — Configurações da loja (site_settings)
```

Todas as rotas abaixo de `/admin` (exceto `/login`) ficam atrás de autenticação, verificada em `middleware.ts`: sem sessão válida, redireciona para `/admin/login?next=<rota>`.

---

## 2. Autenticação

- **Login** (`/admin/login`): formulário com um campo de senha (não precisa de usuário/e-mail, já que é login único). Server Action valida contra `ADMIN_PASSWORD` (variável de ambiente) e, se correta, cria uma sessão (cookie httpOnly assinado, ex. via `iron-session` ou JWT simples) com expiração (sugestão: 7 dias, renovável).
- **Logout**: botão no layout do painel, chama uma Server Action que limpa o cookie e redireciona para `/admin/login`.
- Sem "esqueci minha senha" no MVP — reset é manual (trocar a variável de ambiente e redeploy), documentado como limitação aceitável para um login único.

---

## 3. Layout do painel

Layout compartilhado (`app/admin/(protected)/layout.tsx`) com navegação lateral fixa:

- **Dashboard**
- **Carros** (badge com nº de solicitações... não, badge não se aplica aqui)
- **Solicitações de venda** (badge com contagem de status `novo`)
- **Configurações**
- rodapé: nome do painel + **Sair**

A tela de `/admin/login` usa um layout próprio, sem a navegação lateral.

---

## 4. Telas

### 4.1 Login — `/admin/login`

- Campo: senha.
- Botão "Entrar".
- Mensagem de erro genérica em caso de senha incorreta (sem indicar se o problema seria "usuário" — não existe usuário).

### 4.2 Dashboard — `/admin`

Resumo operacional, sem filtros complexos:

| Card | Fonte |
|---|---|
| Carros ativos | `count(cars where archived = false and status in (available, reserved))` |
| Cliques em "Tenho interesse" (mês atual) | `count(car_events where type = whatsapp_interest_click and created_at in mês atual)` |
| Cliques em "Agendar visita" (mês atual) | `count(car_events where type = visit_request_click and created_at in mês atual)` |
| Solicitações de venda pendentes | `count(seller_submissions where status in (novo, em_analise))` |

Abaixo dos cards, uma lista simples **"Carros mais clicados no mês"** (top 5 por `whatsapp_interest_click`, com link direto para editar cada um) — dá ao Toninho um sinal rápido de quais anúncios estão gerando interesse.

Sem gráficos/série temporal no MVP — só os números atuais, para manter a tela simples de construir e de ler.

### 4.3 Lista de carros — `/admin/cars`

- Busca por marca/modelo (texto livre).
- Filtros: status (`available`/`reserved`/`sold`), arquivado (mostrar/ocultar arquivados — default: ocultar).
- Tabela/lista com: foto de capa, marca+modelo, ano, km, preço, status (badge), destaque (ícone se `featured=true`), ação "Editar".
- Botão "Novo carro" no topo, leva a `/admin/cars/new`.
- Ação rápida por linha: alternar status (`available` ↔ `reserved` ↔ `sold`) sem abrir o formulário completo, para agilizar o dia a dia. Carros em `draft` não têm esse atalho — precisam ser publicados a partir da tela de edição (seção 4.5).
- Paginação.

### 4.4 Novo carro — `/admin/cars/new`

Só a aba **"Dados básicos"** (as demais dependem do carro já existir — ver seção 2 do DATA_MODEL, `car_photos`/`car_inspection_items`/`car_history` referenciam `car_id`):

- Campos: marca, modelo, carroceria, ano fabricação/modelo, km, câmbio, combustível, cor, blindado (sim/não), possui chave reserva (sim/não), origem (particular/leilão), preço, valor de mercado (opcional), prazo estimado de documentação, cidade/UF, status inicial, destaque (checkbox).
- Botão **"Salvar e continuar"**: cria o registro em `cars` (Server Action) e redireciona para `/admin/cars/[carId]` já na aba "Fotos", para o admin completar o anúncio.

### 4.5 Editar carro — `/admin/cars/[carId]`

Abas dentro da mesma tela (não são rotas separadas, para não perder contexto do carro):

1. **Dados básicos** — mesmos campos do formulário de criação, editáveis. Inclui também `archived` (com confirmação: "Remover carro da vitrine? O histórico é mantido.") em vez de um botão de exclusão. Se o carro estiver em `draft`, esta aba mostra um botão **"Publicar carro"**, habilitado só depois que a aba Fotos tiver uma foto de capa definida — ao publicar, o status vira `available`.
2. **Fotos** — grid de miniaturas com drag-to-reorder, botão "Definir como capa" por foto, upload de novas fotos (múltiplas de uma vez), remover foto individual.
3. **Laudo de inspeção** — as 6 categorias fixas (Motor e câmbio, Estrutura/lataria, Pintura, Pneus e rodas, Itens elétricos, Documentação), cada uma com select de status (Aprovado/Reparo leve/Atenção) + campo de observação opcional.
4. **Histórico do veículo** — nº de donos anteriores, sem registro de sinistro (checkbox), revisado em concessionária até (ano, opcional), revisado pela equipe Toninho (checkbox, default marcado), observações adicionais (texto livre).

Cada aba salva independentemente (Server Action própria por aba), para o admin não precisar preencher tudo de uma vez numa sessão só.

### 4.6 Lista de solicitações de venda — `/admin/sell-requests`

- Filtro por status (`novo`, `em_analise`, `proposta_enviada`, `recusado`, `comprado`) — default: mostrar tudo, com `novo` destacado/no topo.
- Lista: foto de capa (primeira foto enviada), marca+modelo+ano informados, nome e telefone do vendedor, cidade, status (badge), data de envio.
- Clique na linha leva ao detalhe.

### 4.7 Detalhe da solicitação — `/admin/sell-requests/[id]`

- Dados informados pelo vendedor (somente leitura): marca, modelo, ano, km, câmbio, cor, observações de conservação.
- Galeria de fotos enviadas.
- Contato do vendedor: nome, telefone (com link direto para abrir WhatsApp com esse número), cidade.
- Campo editável: **status** (select) e **notas internas** (texto livre, não visível ao vendedor).
- Ação contextual: quando o status muda para **"comprado"**, botão **"Criar anúncio a partir desta solicitação"** — cria o carro direto em `draft` (marca/modelo/ano/km/câmbio/cor pré-preenchidos a partir da solicitação, preço zerado e carroceria genérica até o admin ajustar) e leva pra tela de edição do carro criado, evitando redigitar dados já informados pelo vendedor. (Implementado assim, e não pré-preenchendo o formulário de `/admin/cars/new`, para bater com o contrato de `createCarFromSellRequestAction` em `docs/ADMIN_SERVER_ACTIONS.md`.)

### 4.8 Configurações da loja — `/admin/settings`

Formulário único (tabela `site_settings`, singleton):

- Nome da loja, número de WhatsApp, endereço (rua, bairro, cidade, UF, CEP), latitude/longitude (para o mapa).
- Resolve diretamente os placeholders sinalizados como risco no PRD — o Toninho corrige o WhatsApp/endereço reais sem precisar de deploy.

---

## 5. Endpoint público relacionado (fora de `/admin`, mas alimenta o Dashboard)

O Dashboard depende de eventos gerados no **site público**, não no painel:

- `POST /api/events` — chamado pelo front-end público ao clicar em "Tenho interesse pelo WhatsApp" (`type: whatsapp_interest_click`), "Agendar visita" (`type: visit_request_click`) ou ao abrir a página de detalhe (`type: detail_view`, opcional). Grava uma linha em `car_events` com o `car_id` correspondente. Sem autenticação (é público), mas com rate limiting básico para evitar flood.

---

## 6. Estados vazios e validações principais

- **Lista de carros vazia**: mensagem + CTA "Cadastrar primeiro carro".
- **Lista de solicitações vazia**: mensagem simples ("Nenhuma solicitação recebida ainda").
- **Validações de formulário de carro**: preço > 0, ano dentro de um intervalo plausível (ex. 1990–ano atual+1), km ≥ 0, pelo menos 1 foto marcada como capa antes de o carro poder sair do status "rascunho" para aparecer na vitrine pública (a definir se existe um status "rascunho" — ver seção 7).
- **Exclusão de foto de capa**: se o admin remover a foto marcada `is_cover`, o sistema deve promover automaticamente a próxima foto por `position` a capa, para nunca ficar sem foto de capa.

## 7. Decisão: rascunho até publicar

Resolvido: `car_status` ganhou o valor `draft` (ver DATA_MODEL.md). Todo carro criado em `/admin/cars/new` nasce em `draft` e não aparece na Home/Listagem pública. Ele só passa a `available` através do botão "Publicar carro" na aba "Dados básicos" de `/admin/cars/[carId]`, que valida a existência de uma foto de capa e de um preço definido antes de permitir a transição. Contratos exatos dessa e das demais mutações estão em [ADMIN_SERVER_ACTIONS.md](./ADMIN_SERVER_ACTIONS.md).
