# PRD — AuToninho

**Site de venda de carros usados**
Versão 1.0 · Agosto 2026
Baseado no protótipo do Claude Design: [Site de venda de carros](https://claude.ai/design/p/efba6d27-a2b6-41b5-b917-875adfd54678)

---

## 1. Visão geral

O **AuToninho** é o site de uma concessionária real de carros usados, com loja física em Maceió/AL (Jatiúca). Hoje o negócio não tem presença digital própria para vender carros — o objetivo deste produto é criar um site onde compradores encontrem, avaliem e demonstrem interesse em carros do estoque, e onde o Toninho (dono/equipe da loja) consiga gerenciar esse estoque e receber ofertas de pessoas que querem vender seus carros.

### 1.1 Problema

**Para o comprador**: comprar carro usado é uma decisão de alto risco — falta de procedência, medo de sinistro/dívida oculta, e desconfiança de vendedores particulares ou lojas sem histórico.

**Para o Toninho (negócio)**: sem site próprio, a captação de clientes depende de canais informais (indicação, redes sociais, classificados), o que limita alcance e não comunica de forma estruturada os diferenciais da loja (inspeção, garantia, procedência).

**Para quem quer vender o carro**: não há um canal claro para oferecer o carro à loja para avaliação/compra.

### 1.2 Solução

Um site com vitrine de carros inspecionados e com "selo de aprovação", filtros de busca, página de detalhe rica (laudo de inspeção, histórico do veículo, localização), botão direto de contato via WhatsApp, lista de favoritos, um formulário para quem quer vender o carro para a loja, e um painel administrativo para o Toninho gerenciar tudo isso sem depender de programador.

### 1.3 Diferenciais comunicados no site (já validados no protótipo)

- Inspeção de 150+ itens
- Garantia de 3 meses
- Aceita carro na troca
- "Pronto pra rodar"
- Compra em leilão e com particulares, revisa antes de colocar à venda

---

## 2. Objetivos e métricas de sucesso

| Objetivo | Métrica | Meta inicial (sugerida) |
|---|---|---|
| Gerar leads qualificados | Cliques em "Tenho interesse pelo WhatsApp" por carro | Acompanhar como baseline nos 3 primeiros meses |
| Converter visita em contato | Nº de contatos via WhatsApp ÷ visitantes únicos na página de detalhe | Definir baseline pós-lançamento |
| Reduzir tempo de carro parado | Dias médios entre publicação do anúncio e marcação como "vendido" | Acompanhar por mês |
| Engajamento | Nº médio de favoritos por visitante recorrente | Acompanhar como indicador de intenção de compra |
| Captar oferta de vendedores | Nº de submissões no formulário "Vender meu carro" por mês | Acompanhar como baseline |
| Autonomia operacional | Tempo do Toninho para publicar um carro novo (sem dev) | < 10 minutos por anúncio no painel admin |

Este é um negócio real sem prazo fixo de lançamento — as metas acima devem ser tratadas como baseline a validar depois do ar, não como compromissos rígidos de v1.

---

## 3. Personas

**1. Comprador (público-alvo principal)**
Mora em Maceió/AL ou região, quer trocar ou comprar seu próximo carro usado, mas tem receio de comprar de particular ou de loja sem histórico. Pesquisa por marca/preço/km, quer ver fotos, ficha técnica e laudo antes de decidir ir até a loja ou chamar no WhatsApp.

**2. Toninho / equipe da loja (admin)**
Não é necessariamente técnico. Precisa cadastrar carros (fotos, dados, preço), atualizar status (disponível/reservado/vendido), e responder interessados via WhatsApp. Também recebe e avalia ofertas de quem quer vender o carro para a loja.

**3. Potencial vendedor**
Pessoa com um carro que quer vender rápido e sem burocracia diretamente para a loja (venda direta, sem anunciar por conta própria). Quer preencher poucos dados, enviar fotos, e ser contatado com uma proposta.

---

## 4. Escopo do MVP

Confirmado com o responsável do produto: o MVP cobre **todas** as áreas abaixo (não apenas as 4 telas já prototipadas):

1. Home
2. Listagem / Busca de carros
3. Detalhe do carro
4. Favoritos
5. Como funciona
6. Vender meu carro
7. Painel administrativo (gestão de estoque e de ofertas de venda)

### Fora de escopo da v1

- Financiamento (já decidido no design: pagamento é à vista — cartão, Pix, débito ou dinheiro)
- Login/conta para compradores (favoritos continuam via `localStorage` do navegador)
- Pagamento online / checkout dentro do site (a negociação final acontece por WhatsApp/presencial)
- Aplicativo mobile nativo
- Múltiplas lojas/unidades (v1 assume uma unidade: Maceió)

---

## 5. Requisitos funcionais por tela

As telas 1–4 abaixo já existem como protótipo navegável e servem de especificação visual de referência — os requisitos aqui documentam o comportamento esperado por trás do que já foi desenhado.

### 5.1 Home

- Hero com headline, subtítulo e busca rápida com 3 campos: **Marca**, **Preço até**, **Cidade** → botão "Buscar carros" leva para a Listagem já filtrada.
- Faixa de selos de confiança: inspeção 150+ itens, garantia 3 meses, aceita troca, pronto pra rodar.
- Seção "Carros em destaque": grid de carros (cards com foto, marca/modelo, ano, km, cidade/UF, preço, ícone de favoritar) — link "Ver todos os carros" leva à Listagem.
- Seção "Como funciona" (resumo de 3 passos: escolher carro → ver laudo completo → levar com garantia), com link para a página completa "Como funciona".
- Contador de favoritos no header, sincronizado com o estado salvo no navegador.

### 5.2 Listagem / Busca

- Contador de resultados ("N carros encontrados") e ordenação (relevância — outros critérios podem ser adicionados depois, ex. menor preço, menor km).
- Filtros: Marca, Carroceria (hatch/sedã/SUV/picape/perua), Faixa de preço (mín/máx), Quilometragem (mín/máx), Ano (de/até), Câmbio (manual/automático), Blindagem (sem blindagem/blindado), Cor, Origem (particular/leilão). Filtros aplicados via botão "Aplicar filtros"; chips dos filtros ativos com opção de remover individualmente ou "Limpar filtros".
- Grid de cards de carro (2 colunas desktop) com foto, badge de origem, badge "Aprovado", marca/modelo, ano/km/câmbio, preço, cidade/UF, favoritar.
- Paginação.
- Clicar em um card leva à página de Detalhe; clicar no coração favorita sem navegar (o clique não deve disparar a navegação do card).

### 5.3 Detalhe do carro

- Breadcrumb: Início / Comprar carros / Marca / Modelo.
- Galeria de fotos (imagem principal + miniaturas).
- Painel lateral fixo com: badge de origem e "Aprovado pelo Toninho", título (marca/modelo), ano/km/cidade, preço formatado em R$ com aviso "À vista — sem financiamento", ícones das formas de pagamento aceitas (Cartão, Pix, Débito, Dinheiro), botão primário **"Tenho interesse pelo WhatsApp"** (abre `wa.me` com mensagem pré-preenchida citando marca/modelo/preço) e botão secundário **"Agendar visita"**, resumo rápido (ano, km, câmbio, combustível, cor, origem), e nota "Vendido e entregue por AuToninho — Loja [cidade]".
- **Detalhes do veículo**: grid com ano, km, valor de mercado (referência tipo Fipe), combustível, cor, se possui chave reserva, tipo de veículo, prazo estimado de documentação, origem.
- **Laudo de inspeção**: lista de categorias (motor e câmbio, estrutura/lataria, pintura, pneus e rodas, itens elétricos, documentação) cada uma com status (aprovado / reparo leve / atenção).
- **Histórico do veículo**: nº de donos anteriores, existência ou não de registro de sinistro, histórico de revisões, se foi comprado de particular/leilão e revisado pela equipe.
- **Localização**: endereço da loja com mapa.
- **Carros parecidos**: grid de 4 sugestões (mesma faixa de preço/categoria).
- Botão de favoritar disponível tanto no painel lateral quanto nos cards de carros parecidos.

### 5.4 Favoritos

- Lista de carros favoritados (mesmo formato de card da Listagem), persistidos no navegador do visitante (sem necessidade de login).
- Estado vazio com ilustração/mensagem incentivando a navegar e favoritar carros, com CTA para a Listagem.

### 5.5 Como funciona (novo — não estava prototipado)

Página estática explicando o processo ao comprador, expandindo os 3 passos já resumidos na Home:
1. Escolha seu carro (filtre por marca, preço, localização).
2. Veja o laudo completo (histórico + inspeção de 150+ itens).
3. Leve com garantia (3 meses em todo carro, formas de pagamento aceitas).

Deve reforçar também, de forma simples, a origem dos carros (compra em leilão e de particulares, com revisão prévia) e o processo de documentação (prazo estimado, sem burocracia extra para o comprador).

### 5.6 Vender meu carro (novo — não estava prototipado)

Fluxo para quem quer vender o carro diretamente para a loja:

- Formulário com dados do carro (marca, modelo, ano, km, câmbio, cor, estado de conservação, se tem sinistro/pendência) + fotos (mínimo obrigatório a definir, ex. 4 fotos) + dados de contato do vendedor (nome, telefone/WhatsApp, cidade).
- Ao enviar, a submissão vira uma **solicitação de avaliação** com status (novo / em análise / proposta enviada / recusado / comprado), visível no painel admin.
- Confirmação ao vendedor (tela de sucesso + opcionalmente notificação) informando que a loja entrará em contato em até X dias úteis.
- Sem oferta de preço automática no MVP — a avaliação é manual pela equipe da loja.

### 5.7 Painel administrativo (novo — não estava prototipado)

- Acesso restrito por login (usuário/senha) para o Toninho e equipe autorizada — não é público.
- **CRUD de anúncios de carro**: criar, editar, remover/arquivar; campos equivalentes a tudo o que aparece na página de Detalhe (dados do veículo, laudo de inspeção por categoria, histórico, preço, fotos).
- Upload de múltiplas fotos por carro (definindo foto de capa).
- Atualização de **status do anúncio**: disponível, reservado, vendido (carro vendido some da vitrine pública ou fica marcado como indisponível, a definir).
- **Fila de solicitações "Vender meu carro"**: listar submissões, ver detalhes/fotos enviadas, atualizar status, adicionar observações internas.
- (Fora do MVP, mas a considerar depois) múltiplos usuários admin com papéis diferentes, relatório de métricas (cliques em WhatsApp por carro, etc.).

---

## 6. Requisitos não funcionais

- **Responsivo**: layout desktop e mobile para todas as telas (já validado no protótipo em ambos os formatos).
- **Idioma e formatação**: pt-BR; preços em R$ com separador de milhar; datas e prazos em formato brasileiro.
- **SEO**: URLs amigáveis por carro (ex. `/carro/toyota-corolla-2020-xxxx`), meta tags e dados estruturados (schema.org `Vehicle`/`Product`) nas páginas de detalhe para indexação em buscadores.
- **Performance**: carregamento rápido da Listagem e Detalhe mesmo com várias fotos (otimização/compressão de imagem).
- **Confiabilidade dos dados de favoritos**: como não há login, favoritos ficam presos ao navegador/dispositivo — isso deve ser comunicado de forma sutil ao usuário (ex. aviso ao limpar dados do navegador), sem exigir cadastro.
- **Segurança do admin**: autenticação obrigatória, controle de acesso restrito a quem gerencia o estoque.
- **LGPD**: dados pessoais coletados no formulário "Vender meu carro" (nome, telefone, fotos do veículo) devem ter finalidade clara e política de privacidade acessível no site.

---

## 7. Premissas técnicas

- **Stack**: Next.js (App Router) hospedado na Vercel, conforme definido pelo responsável do produto.
- **Dados e imagens**: banco de dados relacional e armazenamento de imagens via integrações do Vercel Marketplace (ex. Postgres + Blob), a confirmar na fase de design técnico.
- **WhatsApp**: MVP usa link direto `wa.me/<numero>?text=<mensagem>` (sem custo, sem API paga) — igual ao já implementado no protótipo. Evoluir para WhatsApp Business API é possível no futuro, mas não é necessário para o MVP.
- **Autenticação**: apenas no painel admin; o site público de compra não exige login em nenhuma etapa.
- **Mapa da localização da loja**: pode usar um embed de mapa (ex. Google Maps) — no protótipo aparece como placeholder.

---

## 8. Riscos e questões em aberto

| Item | Descrição | Responsável por decidir |
|---|---|---|
| Número de WhatsApp real | Protótipo usa número placeholder (`5511999999999`) | Toninho |
| Endereço definitivo da loja | Protótipo usa "Rua Doutor Augusto Cardoso — Jatiúca, Maceió/AL, CEP 57035-590" | Toninho |
| Critério de avaliação de "Vender meu carro" | Como a equipe vai decidir/precificar as ofertas recebidas | Toninho |
| Volume real de estoque inicial | Quantos carros entram no ar no lançamento | Toninho |
| Prazo de lançamento | Ainda não definido | Toninho |
| Fonte do "valor de mercado" exibido no carro (tipo Fipe) | Se será tabela oficial, cálculo interno, ou removido | A decidir na fase de design técnico |

---

## 9. Referência de design

Protótipo funcional (Home, Listagem, Detalhe, Favoritos) e histórico de decisões de estilo/escopo disponíveis no projeto Claude Design:
[Site de venda de carros](https://claude.ai/design/p/efba6d27-a2b6-41b5-b917-875adfd54678)

Decisões de design já validadas nesse protótipo e que devem ser respeitadas na implementação:
- Estilo "Popular & Confiável": paleta clara, laranja (`#FF5A36`) como cor de destaque, tipografia Sora (títulos) + Manrope (texto).
- Sem financiamento, sem login de comprador, favoritos via `localStorage`.
