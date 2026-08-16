# Guia de contribuição — AuToninho

Regras de fluxo de trabalho para este repositório. Complementa [AGENTS.md](./AGENTS.md) (boas práticas técnicas de Next.js, performance e SEO) e a documentação de produto em [`docs/`](./docs).

## 1. Fluxo de branches (Git Flow)

| Branch | Propósito | Nasce de | Vai para |
|---|---|---|---|
| `main` | Produção. Sempre deployável. Deploy automático de produção na Vercel a cada merge. | — | — |
| `develop` | Integração das features em andamento. Deploy de preview na Vercel para validar antes de ir para `main`. | `main` | — |
| `feature/<escopo-curto>` | Uma funcionalidade ou tarefa (ex. `feature/admin-cars-crud`, `feature/car-detail-seo`). | `develop` | `develop` |
| `release/x.y.z` | Estabilização final de uma versão (só ajustes/correções, sem features novas). | `develop` | `main` **e** `develop` |
| `hotfix/<escopo-curto>` | Correção urgente em produção. | `main` | `main` **e** `develop` |

Regras:
- Nada de commit direto em `main` ou `develop` — sempre via Pull Request.
- Nome de branch em `kebab-case`, descrevendo o escopo (ex. `feature/formulario-vender-carro`, não `feature/ajustes`).
- `release/*` e `hotfix/*` terminam com uma tag de versão em `main` (SemVer — ver seção 4).
- PR para `develop`/`main` só é aberto quando a branch está com lint, build e typecheck passando localmente.

## 2. Commits

Convenção: **Conventional Commits** — `tipo(escopo): descrição no imperativo`.

Tipos usados neste projeto:

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade visível (tela, campo, fluxo) |
| `fix` | Correção de bug |
| `refactor` | Mudança de código sem alterar comportamento |
| `perf` | Mudança focada em performance |
| `style` | Formatação, CSS, ajuste visual sem mudar lógica |
| `test` | Testes |
| `docs` | Documentação (`docs/`, `README.md`, comentários) |
| `chore` | Configuração, dependências, tarefas de manutenção |
| `build` / `ci` | Build, pipeline, deploy |

Exemplos:

```
feat(cars): adiciona action de publicar carro (draft → available)
fix(car-detail): corrige link do WhatsApp sem o código do país
refactor(admin): extrai validação de carro para schema compartilhado
docs(data-model): adiciona campo archived em cars
```

### Granularidade

- **1 commit = 1 mudança lógica coesa.** Não misture, no mesmo commit, coisas sem relação (ex. não junte "CRUD de carros" com "ajuste de espaçamento no header").
- Prefira vários commits pequenos dentro de uma `feature/*` a um único commit gigante no fim — cada commit deve, na medida do possível, deixar o projeto num estado que builda.
- Mensagem no imperativo, sem ponto final na primeira linha, até ~72 caracteres. Corpo do commit (opcional) explica o *porquê*, não o *o quê* — o diff já mostra o quê.
- Nunca commitar `.env*`, credenciais ou arquivos de build (`node_modules`, `.next`) — já cobertos pelo `.gitignore`.

## 3. Pull Requests

- Toda `feature/*`, `release/*` e `hotfix/*` é integrada via PR, mesmo trabalhando sozinho — mantém histórico revisável e o preview deploy da Vercel como checagem.
- Título do PR segue a mesma convenção dos commits (`feat(cars): ...`).
- Descrição do PR: o que mudou e por quê (ligar à seção correspondente do PRD/DATA_MODEL/ADMIN_ROUTES/ADMIN_SERVER_ACTIONS quando aplicável).
- `feature/*` → merge em `develop` (squash é aceitável para features pequenas e bem escopadas).
- `release/*` e `hotfix/*` → merge com `--no-ff` (merge commit) em `main` **e** `develop`, preservando o ponto de divergência no histórico — é o que diferencia Git Flow de um trunk-based simples.

## 4. Versionamento

- `package.json#version` segue SemVer (`MAJOR.MINOR.PATCH`).
- Bump de versão acontece na branch `release/*` (ou `hotfix/*` para patch), com tag Git correspondente (`vX.Y.Z`) criada no merge para `main`.

## 5. Checklist antes de abrir um PR

- [ ] `npm run lint` sem erros
- [ ] `npm run build` completa sem erros
- [ ] Nenhum `.env`/segredo no diff (`git status` revisado antes do `git add`)
- [ ] Commits pequenos e com mensagens seguindo a convenção acima
- [ ] Documentação em `docs/` atualizada se a mudança alterou modelo de dados, rotas ou contratos de server actions
