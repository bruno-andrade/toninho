# Roadmap para o MVP — AuToninho

Panorama do que já existe e do que falta para lançar o MVP definido no [PRD.md](./PRD.md). Complementa [DATA_MODEL.md](./DATA_MODEL.md), [ADMIN_ROUTES.md](./ADMIN_ROUTES.md) e [ADMIN_SERVER_ACTIONS.md](./ADMIN_SERVER_ACTIONS.md).

## Onde estamos

**Atualização (v0.5.0):** todas as fases técnicas do MVP (0 a 4) estão concluídas e em produção em `https://toninho-bay.vercel.app`. O que resta é só conteúdo/decisão de negócio do Toninho (estoque real, WhatsApp/endereço definitivos — Fase 3) e o domínio próprio (Fase 4), ambos deliberadamente adiados por decisão do usuário e sem bloquear o restante do produto.

Resumo do que existe hoje:

- **Site público completo**: Home, Busca, Detalhe do carro, Favoritos, Como funciona, Vender meu carro — todas com SEO (`generateMetadata`, Open Graph, `schema.org Vehicle`, sitemap/robots) e Lighthouse 100/100 em Acessibilidade e Boas práticas.
- **Painel administrativo completo**: autenticação por senha única (sessão via cookie assinado), CRUD de carros (dados, fotos, laudo de inspeção, histórico, publicar/arquivar/status), solicitações de venda (lista, detalhe, criar carro a partir de uma solicitação), configurações da loja, Dashboard com métricas reais (carros ativos, solicitações pendentes, cliques em WhatsApp/agendamento no mês, ranking de carros mais clicados).
- **Infra real**: Neon Postgres + Drizzle ORM, Vercel Blob para fotos, deploy automático via Vercel (Preview em PR, Production em `main`).

## Fase 0 — Infra e primeiro deploy ✅ concluída

- [x] `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` reais nas envs da Vercel (Production + Preview) — senha entregue ao usuário fora do repositório
- [x] Projeto Vercel conectado ao repositório `bruno-andrade/toninho` via `vercel git connect` (deploy automático de Preview em PRs, Production em merges em `main`) — PRs agora recebem o check "Vercel"
- [x] Primeiro release cortado (Git Flow: `release/0.1.0` → `main`, tag `v0.1.0`, merge de volta em `develop`) e deployado
- [x] Proteção SSO da Vercel desativada no projeto (por decisão do usuário) — a URL `*.vercel.app` de produção fica pública até termos domínio próprio (Fase 4)
- [x] Login, sessão e leitura do Neon validados de ponta a ponta em produção real (Playwright contra a URL de produção)

## Fase 1 — Site público ✅ concluída

- [x] Home (hero + busca rápida, selos de confiança, carros em destaque, resumo "Como funciona")
- [x] Listagem/Busca (filtros, grid, paginação — via formulário GET, funciona sem JS)
- [x] Detalhe do carro (galeria, ficha técnica, laudo de inspeção, histórico, localização, carros parecidos, CTAs "Tenho interesse pelo WhatsApp" / "Agendar visita")
- [x] Favoritos (via `localStorage`, sem login)
- [x] Como funciona (página estática)
- [x] Vender meu carro (formulário público → `submitSellRequestAction`, com upload de fotos pro Blob)
- [x] `site_settings` já é lido de verdade (com fallback pros valores do protótipo enquanto os reais não são cadastrados na Fase 3)
- [x] SEO: `generateMetadata` + Open Graph por página, `schema.org Vehicle` (JSON-LD) no Detalhe, `sitemap.ts`, `robots.ts`
- [x] `POST /api/events` ligado aos CTAs da página de Detalhe — alimenta as 2 métricas que faltavam no dashboard
- [x] Rate limiting (em memória, por IP) em `submitSellRequestAction`, no upload de fotos do formulário de venda e em `POST /api/events`
- [x] ISR (`revalidate = 60`) na Home e no Detalhe do carro — sem isso essas páginas ficariam congeladas com o snapshot do build

Verificado de ponta a ponta com Playwright contra o Neon/Blob reais: criar e publicar um carro no admin → aparece na Home/Busca/Detalhe → favoritar → aparece em Favoritos → clique no WhatsApp gera evento em `car_events` → formulário "Vender meu carro" grava em `seller_submissions` → `sitemap.xml`/`robots.txt` corretos.

## Fase 2 — Fechar os gaps do admin ✅ concluída

- [x] Aba "Laudo de inspeção" (`updateInspectionItemsAction` + UI)
- [x] Aba "Histórico do veículo" (`updateCarHistoryAction` + UI)
- [x] Lista de carros: busca por marca/modelo, filtro por status, troca rápida de status (`setCarStatusAction`)
- [x] Botão de arquivar/remover carro (`archiveCarAction`) na edição, com confirmação
- [x] Solicitações de venda: lista/detalhe reais, `updateSellRequestStatusAction`, `createCarFromSellRequestAction` (cria carro em draft pré-preenchido e leva pra edição)

Verificado de ponta a ponta com Playwright + inspeção direta do Neon: laudo e histórico salvos, busca/filtro/troca de status na lista, arquivar/restaurar, e o fluxo completo de uma solicitação de venda até virar um carro em draft.

## Fase 3 — Dados e conteúdo reais

- [ ] WhatsApp e endereço reais da loja cadastrados em `/admin/settings` — decisão do usuário: fica para o Toninho fazer quando for lançar, não bloqueia o resto
- [ ] Estoque real de carros do Toninho cadastrado — decisão do usuário: idem, o painel já está pronto pra isso
- [x] Política de privacidade / aviso de LGPD (`/politica-de-privacidade`, linkado no rodapé e no formulário "Vender meu carro") — texto genérico por decisão do usuário, ainda sem CNPJ/razão social definitivos

## Fase 4 — Polimento e lançamento

- [x] Lighthouse (performance/SEO/acessibilidade) nas páginas públicas — todas as 6 páginas (Home, Busca, Detalhe, Como funciona, Vender meu carro, Favoritos) com Acessibilidade 100/100 e Boas práticas 100/100. Correções aplicadas:
  - Contraste de cor (WCAG AA 4.5:1): a cor de marca `#FF5A36` e o cinza `#A8A59C` usados como texto/ícone/link não atingiam contraste suficiente — trocados por `#C93A1A` (com hover `#B83318`) e `#6B6B68`/`#5A5A57`/`#1A5FCB` conforme o fundo de cada uso. `#FF5A36` original seguiu disponível só como cor decorativa, não como texto.
  - Rótulo do `<select>` "Ordenar por" na Busca sem associação (`select-name`) — corrigido com `<label htmlFor>`/`id`.
  - Alvo de toque do botão de favoritar pequeno demais (`target-size`) — área clicável ampliada pra 24×24px sem alterar o glifo visual.
  - `htmlLimitedBots` configurado em `next.config.ts` pra garantir que bots de preview de link (WhatsApp incluso — canal de contato principal do site) sempre recebam a metadata já resolvida no `<head>`, e não a versão em streaming.
  - Dois "achados" do Lighthouse verificados e descartados por não serem bugs reais: `is-crawlable` em `/favoritos` (página é `noindex` de propósito, só tem conteúdo de `localStorage` por usuário) e `meta-description` ausente em `/carro/[slug]` num único run (confirmado via `curl` com 3 user-agents diferentes que a tag existe corretamente dentro do `<head>` — falso negativo do próprio Lighthouse).
- [x] Conferência mobile/desktop da implementação real — verificado com Playwright (viewports 390×844 e 1440×900) nas 6 páginas públicas + política de privacidade, com 2 carros de teste reais (com foto) pra validar grid/cards/galeria. Sem overflow, sem quebra de layout; dados limpos do Neon/Blob depois.
- [ ] Domínio próprio (`autoninho.com.br`) — compra e configuração, fora do tier grátis de hospedagem — decisão do usuário: fica pra depois, não bloqueia o restante do MVP; site segue publicado em `https://toninho-bay.vercel.app`
- [x] Revisão final: docs batendo com o que foi implementado — auditado `PRD.md`, `DATA_MODEL.md`, `ADMIN_ROUTES.md` e `ADMIN_SERVER_ACTIONS.md` contra o código real. `DATA_MODEL.md` e as rotas do painel batiam exatamente. Achados corrigidos:
  - **Gap real (corrigido)**: o Dashboard (`/admin`) nunca chegou a consultar `car_events` — os 2 cliques em WhatsApp/agendamento apareciam como `"—"` fixo e "Carros mais clicados" como lista sempre vazia, apesar de `POST /api/events` já gravar os eventos corretamente desde a Fase 1. Agora o Dashboard agrega de verdade (mês corrente) os cliques em "Tenho interesse"/"Agendar visita" e lista o top 5 de carros por cliques em WhatsApp no mês, com link direto pra editar. Verificado com Playwright + dados de teste no Neon.
  - **Drift de documentação (corrigido, sem mudar código)**: `ADMIN_SERVER_ACTIONS.md` descrevia todas as actions recebendo um único objeto de input tipado; na implementação real, actions ligadas a `<form>`/`useActionState` recebem `FormData` (e `createCarAction`/`updateCarBasicsAction` usam `redirect()` no sucesso em vez de retornar `ActionResult`), e as demais actions recebem argumentos posicionais, não um objeto — documento atualizado para refletir as assinaturas reais.
  - `PRD.md` §5.7 listava "relatório de métricas (cliques em WhatsApp por carro)" como fora do MVP — atualizado, já que o Dashboard corrigido acima cobre isso.
