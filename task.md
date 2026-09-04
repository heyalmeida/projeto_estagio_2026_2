# Task Checklist — Vestaply

## Setup
- [x] Criar `package.json` com Next 15, Prisma 5, NextAuth 5, Zod, Tailwind 3
- [x] Criar `tsconfig.json` strict com path alias `@/*`
- [x] Criar `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`
- [x] Criar `.eslintrc.json` (next/core-web-vitals)
- [x] Criar `.gitignore` (inclui `prisma/dev.db`)
- [x] Criar `.env.example`

## Banco de dados
- [x] Criar `prisma/schema.prisma` (Admin + Demand com `targetUnitPriceCents` Int)
- [x] Criar `prisma/seed.ts` (idempotente, hash bcrypt)
- [x] Rodar `prisma migrate dev --name init`
- [x] Rodar `npm run seed` e validar admin criado

## Camada de domínio
- [x] `src/lib/constants.ts` — status, categorias
- [x] `src/lib/validators.ts` — schemas Zod (formulário + admin + login)
- [x] `src/lib/protocol.ts` — `generateProtocol` (crypto randomBytes)
- [x] `src/lib/format.ts` — pt-BR date/currency + `parseBrlToCents`
- [x] `src/lib/prisma.ts` — singleton
- [x] `src/lib/queries.ts` — `listDemands`, `getDashboardSummary`, `getDemandById`

## Autenticação
- [x] `src/lib/auth.config.ts` — Edge-safe (sem bcrypt/Prisma)
- [x] `src/lib/auth.ts` — NextAuth v5 com Credentials + bcrypt
- [x] `src/middleware.ts` — edge middleware com auth.config
- [x] `src/app/api/auth/[...nextauth]/route.ts` — handlers

## Server Actions
- [x] `src/app/actions/submit-demand.ts` — pública, Zod, força `pendente`
- [x] `src/app/actions/admin.ts` — `updateDemandStatus` (typed) + wrappers void

## UI base
- [x] `src/components/Logo.tsx` (com next/image)
- [x] `src/components/StatusBadge.tsx`
- [x] `src/components/Field.tsx` (com `useId` e `aria-describedby`)
- [x] `src/components/Textarea.tsx`
- [x] `src/components/Select.tsx`
- [x] `src/components/Currency.tsx`

## Landing
- [x] `src/components/landing/LandingHeader.tsx`
- [x] `src/components/landing/LandingFooter.tsx`
- [x] `src/components/landing/DemandForm.tsx` (client)
- [x] `src/app/page.tsx` — hero, problema, como funciona, benefícios, form

## Login
- [x] `src/app/login/page.tsx`
- [x] `src/app/login/LoginForm.tsx`
- [x] `src/app/login/actions.ts`

## Painel admin
- [x] `src/app/admin/layout.tsx` (defesa em profundidade)
- [x] `src/app/admin/actions.ts` (logoutAction)
- [x] `src/app/admin/AdminHeader.tsx` (client)
- [x] `src/app/admin/loading.tsx`
- [x] `src/app/admin/page.tsx` (listagem)
- [x] `src/app/admin/_components/SummaryCards.tsx`
- [x] `src/app/admin/_components/DemandFilters.tsx`
- [x] `src/app/admin/_components/DemandTable.tsx` (tabela + cards)
- [x] `src/app/admin/_components/StatusActions.tsx` (client)
- [x] `src/app/admin/_components/InternalNotesForm.tsx` (client)
- [x] `src/app/admin/[id]/page.tsx` (detalhe)
- [x] `src/app/admin/[id]/not-found.tsx`

## Layout raiz
- [x] `src/app/layout.tsx` (Inter + Fraunces, favicon, Open Graph, skip-link)
- [x] `src/app/globals.css` (tokens + classes)

## Assets
- [x] `public/favicon.ico` (multi-tamanho: 16x16, 32x32, 48x48)
- [x] `public/logo.png` (logo da marca)

## Documentação
- [x] `DESAFIO.md` preservado
- [x] `README.md` reescrito
- [x] `DECISOES.md` com decisões e seção IA
- [x] `implementation_plan.md` (plano de execução)
- [x] `task.md` (checklist)

## Verificação
- [x] `npm install` (concluído: 392 pacotes via `registry.npmmirror.com`)
- [x] `prisma generate` (ok)
- [x] `prisma migrate dev` (aplicado)
- [x] `npm run seed` (admin criado)
- [x] `npm run lint` (sem warnings/erros)
- [x] `npm run build` (sem erros de tipo, 5 rotas geradas, sem warnings)
- [x] `npm start` (produção roda em ~270ms)
- [x] `GET /` retorna 200 (landing)
- [x] `GET /admin` sem sessão retorna 302 → `/login?callbackUrl=/admin`
- [x] `GET /login` retorna 200
- [x] Login com credenciais válidas retorna 302 + cookie de sessão
- [x] `GET /api/auth/session` retorna o admin logado
- [x] `GET /admin` com sessão retorna 200, mostra 3 demandas demo
- [x] Filtros (status, busca, categoria) funcionam
- [x] `GET /admin/:id` retorna 200 com detalhes completos
- [x] `GET /admin/nao-existe` renderiza not-found customizado
- [x] Ordenação: data desejada mais próxima primeiro (DEMO02 < DEMO01 < DEMO03)
- [x] Valor potencial calculado corretamente: 120 × R$28,90 = R$3.468,00
- [x] Status sempre nasce como `pendente` (validado por `DEFAULT_DEMAND_STATUS`)
- [x] Protocolo gerado com `crypto.randomBytes` (formato `VST-2026-XXXXXX`)
- [x] Validação Zod: email, data passada, qtd negativa, categoria inválida rejeitadas
- [x] Validação pt-BR: `parseBrlToCents` aceita "12,50", "1.234,56", rejeita "abc"
- [x] Defesa em profundidade: middleware + layout + cada Server Action verifica sessão
- [x] `/favicon.ico` servido com `image/x-icon`, 3 tamanhos
- [x] `/logo.png` servido com `image/png`
- [x] Logo renderizado com `next/image` (otimizado com srcset 1x/2x)
- [x] Open Graph: `og:title`, `og:description`, `og:image`, `og:locale=pt_BR`, `og:site_name`
- [x] Twitter Card: `summary` com título, descrição e imagem