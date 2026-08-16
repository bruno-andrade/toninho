<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Regras de desenvolvimento — AuToninho

Fluxo de branches/commits: ver [CONTRIBUTING.md](./CONTRIBUTING.md). As regras abaixo são técnicas, específicas do código deste projeto (site + painel admin descritos em [`docs/`](./docs)).

## Next.js: documentação sempre atualizada via Context7

Este projeto está no **Next.js 16.x** (ver `package.json`) — uma versão recente o suficiente para divergir do conhecimento de treinamento de qualquer modelo, conforme já alertado no bloco acima.

- **Antes de implementar ou alterar qualquer coisa que use uma API do Next.js** (Server Actions, Route Handlers, Metadata API, `next/image`, cache/`revalidate`, Middleware, roteamento, etc.), consultar a documentação **atual** via **Context7 MCP** (`resolve-library-id` → `query-docs`), não confiar em memória/treinamento — mesmo para APIs que parecem óbvias/estáveis.
- Como segunda fonte, checar `node_modules/next/dist/docs/` (docs da versão exata instalada neste repositório).
- Se uma convenção usada no código divergir do que o Context7/docs locais descrevem para 16.x, a documentação atual vence — corrigir o código, não a doc.
- Preferir **Server Components** por padrão; `"use client"` só quando a tela precisar de interatividade/hooks/APIs de navegador (ex. reorder de fotos por drag-and-drop, formulário do painel admin).
- Mutações via **Server Actions** (ver `docs/ADMIN_SERVER_ACTIONS.md`) — Route Handler só nos casos que exigem (upload de fotos via client upload do Vercel Blob, endpoint público de eventos).
- TypeScript em modo estrito (já configurado em `tsconfig.json`) — sem `any`; tipar os contratos de entrada/saída das server actions conforme documentado.

## Performance

Aplicação simples, mas com atenção desde o início — mais barato manter do que corrigir depois:

- **`next/image`** em toda foto de carro (capa, galeria, thumbnails) — nunca `<img>` cru no site público.
- Buscar dados no Server Component mais próximo de onde são usados; evitar waterfalls (não fazer fetch sequencial quando dá para paralelizar).
- Usar `Suspense`/streaming nas seções que dependem de queries mais lentas (ex. "carros parecidos" na página de Detalhe), para não travar o first paint da página inteira.
- Aproveitar cache do Next.js nas páginas públicas (Home, Listagem, Detalhe) — conteúdo muda pouco (só quando o admin publica/edita um carro); invalidar via `revalidateTag`/`revalidatePath` a partir das server actions de carro, em vez de desabilitar cache.
- Paginação real na Listagem (já definida no `ADMIN_ROUTES.md`/`DATA_MODEL.md`) — nunca carregar o estoque inteiro de uma vez.
- Manter o bundle do **site público** enxuto — o painel admin (uso interno, autenticado) pode se dar ao luxo de mais JS no cliente; o site de vendas não.
- Medir com Lighthouse/PageSpeed Insights e, em produção, Vercel Speed Insights — não só "parece rápido".

## SEO e Lighthouse

O site público (Home, Listagem, Detalhe do carro, Como funciona) precisa indexar bem e pontuar alto no Lighthouse:

- **Metadata API** (`generateMetadata`) em toda página pública: `title`, `description`, Open Graph (incluindo imagem do carro na página de Detalhe) e `canonical`.
- **Dados estruturados** `schema.org` (`Vehicle`/`Product`, com preço e disponibilidade) na página de Detalhe do carro, conforme já indicado no PRD.
- URLs amigáveis via `slug` (já definido em `DATA_MODEL.md`) — nada de `?id=123` como URL pública de carro.
- `app/sitemap.ts` e `app/robots.ts` dinâmicos, listando os carros publicados (`status != draft`, `archived = false`).
- Acessibilidade conta para SEO e Lighthouse: HTML semântico, `alt` descritivo em toda imagem de carro (ex. `"Toyota Corolla XEi 2020, foto 1"`), contraste de cor adequado, foco visível em elementos interativos.
- Core Web Vitals de olho desde a implementação, não só no fim:
  - **LCP**: priorizar o carregamento da imagem hero/capa (`priority` no `next/image`) nas páginas onde ela é o maior elemento visível.
  - **CLS**: sempre declarar `width`/`height` (ou usar `fill` com container de tamanho fixo) nas imagens, para não pular layout ao carregar.
  - **INP**: evitar JavaScript bloqueante no carregamento inicial do site público; interações pesadas (favoritar, filtros) não podem travar a UI.
- Favicon, `viewport` e metadata básica corretos no `layout.tsx` raiz (parte já vem do scaffold do Next.js, revisar ao customizar).
