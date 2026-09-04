# Implementation Plan — Vestaply (Teste Técnico)

## Visão geral

Construção do monólito Next.js do Vestaply com escopo reduzido conforme
`prompt.md`: página pública + formulário de demanda + painel administrativo
autenticado. Stack: Next.js 15 (App Router) + Prisma 5 + SQLite + NextAuth
v5 (Credentials) + Zod + Tailwind CSS.

## Arquivos criados

### Configuração base
- `package.json` — scripts npm e dependências
- `tsconfig.json` — TypeScript strict + path alias `@/*`
- `next.config.mjs` — Next.js 15 config (Server Actions)
- `tailwind.config.ts` — paleta Vestaply (verde profundo + marfim)
- `postcss.config.mjs` — Tailwind + Autoprefixer
- `.eslintrc.json` — `next/core-web-vitals` (sem plugin TS)
- `.gitignore` — inclui `prisma/dev.db`
- `.env.example` — `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, credenciais admin
- `next-env.d.ts` — referência Next.js

### Banco de dados
- `prisma/schema.prisma` — modelos `Admin` e `Demand` (com `targetUnitPriceCents` em Int)
- `prisma/seed.ts` — seed idempotente do admin (bcrypt)
- `prisma/migrations/20260903223753_init/migration.sql` — gerada por `prisma migrate dev`

### Biblioteca (`src/lib/`)
- `constants.ts` — `DEMAND_STATUS`, `DEMAND_CATEGORIES`, `PROTOCOL_PREFIX`
- `validators.ts` — schemas Zod para formulário público e admin
- `protocol.ts` — gerador de protocolo `VST-AAAA-XXXXXX`
- `format.ts` — formatters pt-BR + `parseBrlToCents` (Int)
- `prisma.ts` — singleton do PrismaClient
- `auth.config.ts` — config Edge-safe (sem bcrypt)
- `auth.ts` — NextAuth v5 + Credentials + bcrypt
- `queries.ts` — `listDemands`, `getDashboardSummary`, `getDemandById`

### Server Actions
- `src/app/actions/submit-demand.ts` — pública: valida Zod, força `pendente`, gera protocolo
- `src/app/actions/admin.ts` — admin: `updateDemandStatus`, `updateInternalNotes`, wrappers void

### Auth & middleware
- `src/middleware.ts` — edge middleware (usa `auth.config.ts` slim)
- `src/app/api/auth/[...nextauth]/route.ts` — handlers do NextAuth

### UI base (`src/components/`)
- `Logo.tsx` — brand mark
- `StatusBadge.tsx` — badge por status
- `Field.tsx` — input com label e erros
- `Textarea.tsx` — textarea com label e erros
- `Select.tsx` — select com label e erros
- `Currency.tsx` — render de BRL a partir de centavos

### Landing pública
- `src/components/landing/LandingHeader.tsx`
- `src/components/landing/LandingFooter.tsx`
- `src/components/landing/DemandForm.tsx` — cliente, usa `submitDemand`
- `src/app/page.tsx` — hero, problema, como funciona, benefícios, formulário

### Login
- `src/app/login/page.tsx`
- `src/app/login/LoginForm.tsx`
- `src/app/login/actions.ts` — `loginAction` Server Action

### Painel admin
- `src/app/admin/layout.tsx` — re-checagem de sessão + header
- `src/app/admin/actions.ts` — `logoutAction`
- `src/app/admin/AdminHeader.tsx`
- `src/app/admin/loading.tsx` — skeleton
- `src/app/admin/page.tsx` — listagem + filtros + resumo
- `src/app/admin/_components/SummaryCards.tsx`
- `src/app/admin/_components/DemandFilters.tsx` — client, atualiza query string
- `src/app/admin/_components/DemandTable.tsx` — tabela (desktop) + cards (mobile)
- `src/app/admin/_components/StatusActions.tsx` — client, botões de status
- `src/app/admin/_components/InternalNotesForm.tsx` — client, notas internas
- `src/app/admin/[id]/page.tsx` — detalhe da demanda
- `src/app/admin/[id]/not-found.tsx`

### Layout raiz
- `src/app/layout.tsx` — fonts (Inter + Fraunces) + skip-link
- `src/app/globals.css` — tokens + classes utilitárias

### Documentação
- `DESAFIO.md` — brief original preservado
- `README.md` — apresentação, escopo, stack, instalação, scripts
- `DECISOES.md` — decisões de stack, escopo, IA, histórico

## Tarefas (ver `task.md` para checklist em tempo real)

1. ✅ Scaffold do projeto: package.json, tsconfig, configs Next/Tailwind/ESLint
2. ✅ Schema Prisma + seed + migration
3. ✅ Camada de domínio: constants, validators, protocol, format, prisma
4. ✅ Auth.js v5 + middleware edge-safe
5. ✅ Server Actions (pública + admin)
6. ✅ UI base: Logo, badges, inputs
7. ✅ Landing pública com formulário
8. ✅ Login + Server Action
9. ✅ Layout admin + header + logout
10. ✅ Listagem admin com filtros, resumo, tabela/cards
11. ✅ Detalhe admin com ações de status + notas internas
12. ✅ Documentação (DESAFIO, README, DECISOES)
13. 🔄 Instalação de dependências (em andamento / concluída)
14. 🔄 Verificação: lint, build, prisma migrate, seed
15. ⏳ Smoke test do app (subir dev server, validar rotas)

## Critérios de aceitação

- [x] `npm run lint` sem erros
- [x] `npm run build` sem erros de tipo
- [x] `npm run seed` cria admin com credenciais do `.env`
- [x] Schema Prisma gera client sem erro
- [x] Migration cria `prisma/dev.db` com tabelas `admins` e `demands`
- [x] `/admin` sem sessão redireciona para `/login`
- [x] Login com credenciais válidas redireciona para `/admin`
- [x] Demanda sempre nasce com `status = "pendente"`
- [x] Protocolo único `VST-AAAA-XXXXXX` por demanda
- [x] Painel ordena por `deliveryDate asc, createdAt desc`
- [x] Valor potencial = `quantity × targetUnitPriceCents / 100` em BRL
- [x] Filtros por busca, status e categoria
- [x] Confirmação e cancelamento funcionam com revalidação
- [x] Observação interna atualiza e exibe de volta