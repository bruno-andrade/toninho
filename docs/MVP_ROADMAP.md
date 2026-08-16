# Roadmap para o MVP — AuToninho

Panorama do que já existe e do que falta para lançar o MVP definido no [PRD.md](./PRD.md). Complementa [DATA_MODEL.md](./DATA_MODEL.md), [ADMIN_ROUTES.md](./ADMIN_ROUTES.md) e [ADMIN_SERVER_ACTIONS.md](./ADMIN_SERVER_ACTIONS.md).

## Onde estamos

O painel administrativo (`/admin`) está funcional e verificado ponta a ponta contra o Neon e o Vercel Blob reais:

- Autenticação por senha única, sessão via cookie assinado, rotas protegidas
- Layout e navegação do admin
- Neon Postgres (plano Free) + Drizzle ORM, schema completo migrado
- Vercel Blob (`autoninho-photos`, acesso público) para fotos
- CRUD de carros: criar, listar, editar dados básicos, publicar (`draft` → `available`), fotos (upload, capa, reordenar, remover)
- Configurações da loja: leitura/gravação real
- Dashboard: 2 métricas reais (carros ativos, solicitações pendentes)

**O que ainda falta é significativo**: o site público inteiro (o que efetivamente gera lead para o Toninho) ainda não existe, e o projeto nunca foi para o ar.

## Fase 0 — Infra e primeiro deploy ✅ concluída

- [x] `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` reais nas envs da Vercel (Production + Preview) — senha entregue ao usuário fora do repositório
- [x] Projeto Vercel conectado ao repositório `bruno-andrade/toninho` via `vercel git connect` (deploy automático de Preview em PRs, Production em merges em `main`) — PRs agora recebem o check "Vercel"
- [x] Primeiro release cortado (Git Flow: `release/0.1.0` → `main`, tag `v0.1.0`, merge de volta em `develop`) e deployado
- [x] Proteção SSO da Vercel desativada no projeto (por decisão do usuário) — a URL `*.vercel.app` de produção fica pública até termos domínio próprio (Fase 4)
- [x] Login, sessão e leitura do Neon validados de ponta a ponta em produção real (Playwright contra a URL de produção)

## Fase 1 — Site público

A peça que falta e a mais importante: é o que transforma o estoque cadastrado no admin em geração de lead de verdade.

- [ ] Home (hero + busca rápida, selos de confiança, carros em destaque, resumo "Como funciona")
- [ ] Listagem/Busca (filtros, grid, paginação)
- [ ] Detalhe do carro (galeria, ficha técnica, laudo de inspeção, histórico, localização, carros parecidos, CTAs "Tenho interesse pelo WhatsApp" / "Agendar visita")
- [ ] Favoritos (via `localStorage`, sem login)
- [ ] Como funciona (página estática)
- [ ] Vender meu carro (formulário público → `submitSellRequestAction`, hoje só especificado em ADMIN_SERVER_ACTIONS.md)
- [ ] Usar `site_settings` (WhatsApp/endereço reais) em vez de valores fixos
- [ ] SEO: `generateMetadata`, Open Graph, `schema.org Vehicle`, `sitemap.ts`, `robots.ts`
- [ ] `POST /api/events` ligado aos CTAs da página de Detalhe — alimenta as 2 métricas que faltam no dashboard
- [ ] Rate limiting em `submitSellRequestAction` e `POST /api/events`

## Fase 2 — Fechar os gaps do admin

- [ ] Aba "Laudo de inspeção" (`updateInspectionItemsAction` + UI)
- [ ] Aba "Histórico do veículo" (`updateCarHistoryAction` + UI)
- [ ] Lista de carros: busca por marca/modelo, filtro por status, troca rápida de status (`setCarStatusAction`)
- [ ] Botão de arquivar/remover carro (`archiveCarAction`) na edição
- [ ] Solicitações de venda: lista/detalhe reais + `updateSellRequestStatusAction` + `createCarFromSellRequestAction` (dependem do formulário público da Fase 1)

## Fase 3 — Dados e conteúdo reais

- [ ] WhatsApp e endereço reais da loja cadastrados em `/admin/settings`
- [ ] Estoque real de carros do Toninho cadastrado
- [ ] Política de privacidade / aviso de LGPD no formulário "Vender meu carro"

## Fase 4 — Polimento e lançamento

- [ ] Lighthouse (performance/SEO/acessibilidade) nas páginas públicas
- [ ] Conferência mobile/desktop da implementação real
- [ ] Domínio próprio (`autoninho.com.br`) — compra e configuração, fora do tier grátis de hospedagem
- [ ] Revisão final: docs batendo com o que foi implementado
