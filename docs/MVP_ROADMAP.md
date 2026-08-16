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

- [ ] WhatsApp e endereço reais da loja cadastrados em `/admin/settings`
- [ ] Estoque real de carros do Toninho cadastrado
- [ ] Política de privacidade / aviso de LGPD no formulário "Vender meu carro"

## Fase 4 — Polimento e lançamento

- [ ] Lighthouse (performance/SEO/acessibilidade) nas páginas públicas
- [ ] Conferência mobile/desktop da implementação real
- [ ] Domínio próprio (`autoninho.com.br`) — compra e configuração, fora do tier grátis de hospedagem
- [ ] Revisão final: docs batendo com o que foi implementado
