# Vestaply

> Marketplace B2B vertical para o atacado de moda brasileiro — focado em captação e qualificação de demandas de compra.

Esta implementação é o **módulo de entrada e gestão de demandas** do Vestaply. O marketplace completo (cadastros de compradores e fornecedores, feed, ofertas, match, pagamentos e chat) está fora do escopo deste teste e foi documentado como corte consciente em [`DECISOES.md`](./DECISOES.md). O brief original do desafio foi preservado em [`DESAFIO.md`](./DESAFIO.md).

---

## O que o Vestaply resolve

O atacado de moda no Brasil é fragmentado: catálogos em PDF, conversas de WhatsApp, indicações informais. Compradores perdem tempo garimpando fornecedores e fornecedores perdem leads B2B qualificados. O Vestaply ataca esse gargalo com **demanda reversa**: o comprador descreve o que precisa, a equipe Vestaply qualifica e encaminha para fornecedores compatíveis.

Esta entrega implementa o **mínimo viável para validar a entrada do funil**:

- Página pública apresentando o produto;
- Formulário que persiste demandas com status `pendente`;
- Geração de protocolo único por demanda;
- Painel administrativo autenticado para gerenciar e qualificar as demandas.

---

## Escopo implementado

| Área | Comportamento |
|------|---------------|
| Landing | Hero institucional, problema, como funciona em 3 etapas, benefícios, formulário e footer. |
| Formulário | Validação Zod no servidor (todos os campos re-validados antes de persistir), status sempre `pendente`, protocolo `VST-AAAA-XXXXXX`, confirmação visual com protocolo. |
| Login | Credenciais com bcrypt, sessão JWT, redirecionamento para `/admin` em sucesso. |
| Painel `/admin` | Resumo operacional (totais, valor potencial), busca textual, filtros por status e categoria, listagem responsiva (tabela no desktop, cards no mobile), ordenação por data desejada de entrega (asc), createdAt como desempate (desc). |
| Detalhe `/admin/[id]` | Confirmação, cancelamento e reabertura como pendente; observação interna privada; valor potencial calculado em tempo de exibição. |
| SEO/Identidade | Favicon (multi-tamanho), logo via next/image, Open Graph e Twitter Card. |

---

## Stack

- **Next.js 15** (App Router e Server Actions)
- **TypeScript** em modo `strict`
- **Prisma 5** + **SQLite** local (`prisma/dev.db`, ignorado pelo Git)
- **Auth.js (NextAuth v5)** com Credentials Provider e sessões JWT
- **Zod** para validação de payloads no servidor
- **bcryptjs** para hash de senha (cost 12)
- **Tailwind CSS v3** com paleta institucional (verde profundo + marfim)
- **next/font** com Fraunces (editorial) e Inter (sans-serif)

---

## Pré-requisitos

- **Node.js 20.x ou 22.x**
- **npm 10+**

---

## Instalação

```bash
# 1. Instale as dependências a partir do lockfile
npm ci

# 2. Copie o arquivo de exemplo de variáveis de ambiente
cp .env.example .env

# 3. Gere um AUTH_SECRET novo (opcional mas recomendado)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Cole o resultado na variável AUTH_SECRET do .env
```

A `DATABASE_URL` já aponta para `prisma/dev.db` (SQLite local). O arquivo de banco de dados **não é versionado**.

---

## Migração e seed

```bash
# Cria o banco SQLite local e aplica todas as migrations
npm run prisma:migrate -- --name init

# Cria o administrador de demonstração (idempotente)
npm run seed
```

O seed usa as credenciais definidas em `ADMIN_EMAIL` e `ADMIN_PASSWORD`:

- E-mail: `admin@vestaply.local`
- Senha: `vestaply-admin-2026`

> **Importante:** altere essas credenciais antes de qualquer deploy público.

---

## Execução

```bash
# Modo desenvolvimento
npm run dev
# Acesse http://localhost:3000

# Build de produção + start
npm run build
npm start
```

Rotas principais:

- `GET /` — landing pública com formulário de demanda
- `GET /login` — login administrativo
- `GET /admin` — painel (protegido, redireciona para `/login` se não autenticado)
- `GET /admin/:id` — detalhe de uma demanda

---

## Scripts npm

| Script | O que faz |
|--------|-----------|
| `npm run dev` | Sobe o Next.js em modo dev. |
| `npm run build` | Gera o Prisma Client e faz o build de produção. |
| `npm start` | Inicia o servidor de produção. |
| `npm run lint` | Roda o ESLint com `next/core-web-vitals`. |
| `npm run prisma:generate` | Regenera o Prisma Client. |
| `npm run prisma:migrate` | Aplica migrações em ambiente dev. |
| `npm run prisma:deploy` | Aplica migrações em produção. |
| `npm run seed` | Semeia (ou atualiza) o admin do `.env`. |
| `npm run test:validation` | Executa os testes de validação (schema Zod, parser monetário, datas civis). |

---

## Como testar a proteção

1. Abra uma aba anônima e acesse `http://localhost:3000/admin`.
2. Você será redirecionado para `/login?callbackUrl=/admin`.
3. Faça login com `admin@vestaply.local` / `vestaply-admin-2026`.
4. Você retornará ao `/admin` autenticado.
5. Clique em **Sair** para encerrar a sessão.

A verificação acontece em três camadas: **middleware** (edge), **layout** do `/admin` e **dentro de cada Server Action administrativa**.

---

## Funcionalidades

- [x] Landing pública com seções: header, hero, problema, como funciona, benefícios, formulário, footer.
- [x] Formulário com validação Zod no servidor (todos os campos, sem exceção).
- [x] Validação de data civil (não shifta um dia em fusos diferentes de UTC).
- [x] Validação monetária com regras explícitas: rejeita zero, >2 casas decimais e formatos ambíguos.
- [x] Persistência com status `pendente` forçado pelo servidor.
- [x] Geração de protocolo `VST-AAAA-XXXXXX` único.
- [x] Confirmação visual com protocolo.
- [x] Login com credenciais (bcrypt + JWT).
- [x] Painel com resumo operacional (totais, valor potencial calculado em tempo real).
- [x] Busca textual e filtros por status e categoria.
- [x] Listagem responsiva (tabela no desktop, cards no mobile).
- [x] Ordenação por data desejada de entrega (asc), com createdAt como desempate (desc).
- [x] Confirmação e cancelamento de demanda com Server Actions.
- [x] Reabrir demanda como pendente.
- [x] Observação interna privada (somente equipe Vestaply).
- [x] Cálculo de valor potencial (`quantidade × preço-alvo` em centavos).
- [x] Logout funcional (`"use server"` explícito — não inclui bcrypt no bundle).
- [x] Estado vazio no painel quando não há demandas.
- [x] Estados de loading com skeleton.
- [x] Acessibilidade: foco visível, labels associados, mensagens de erro com `role="alert"`, pular para o conteúdo.
- [x] Favicon e Open Graph configurados.
- [x] `npm ci` funciona (lockfile consistente).

---

## Estrutura do projeto

```
.
├── prisma/
│   ├── schema.prisma          # Modelos Admin e Demand
│   ├── seed.ts                # Seed idempotente do administrador
│   └── migrations/             # Versionadas, geradas por prisma migrate
├── public/
│   ├── favicon.ico            # Ícone multi-tamanho (16/32/48)
│   └── logo.png               # Logo da marca
├── scripts/
│   ├── seed-demo.ts           # 3 demandas de demonstração
│   ├── test-action.ts         # Smoke test de update/cancel/notas
│   ├── test-form-validation.ts# Smoke test do schema Zod e parseBrlToCents
│   └── list-ids.ts           # Lista IDs+protocolos+status das demandas
├── src/
│   ├── app/
│   │   ├── actions/           # Server Actions: submit-demand, admin
│   │   ├── admin/             # Painel protegido
│   │   │   ├── _components/   # Summary, filtros, tabela, status, notas
│   │   │   ├── [id]/          # Detalhe da demanda
│   │   │   ├── layout.tsx     # Re-checagem de sessão + header
│   │   │   ├── loading.tsx    # Skeleton
│   │   │   └── page.tsx       # Listagem
│   │   ├── api/auth/[...nextauth]/route.ts  # Handlers do NextAuth
│   │   ├── login/             # Tela de login
│   │   ├── globals.css        # Tokens visuais + componentes utilitários
│   │   ├── layout.tsx         # Layout raiz com fontes, favicon e SEO
│   │   └── page.tsx           # Landing pública
│   ├── components/            # Logo, badges, inputs, currency
│   ├── lib/
│   │   ├── date.ts            # Helpers de data civil (parseCivilDate, etc.)
│   │   ├── auth.config.ts     # NextAuth Edge-safe (sem bcrypt)
│   │   ├── auth.ts            # NextAuth config completa
│   │   ├── constants.ts       # Status e categorias canônicos
│   │   ├── format.ts          # Formatadores pt-BR + parseBrlToCents
│   │   ├── prisma.ts          # Singleton do PrismaClient
│   │   ├── protocol.ts        # Gerador de protocolo
│   │   ├── queries.ts         # Consultas do painel
│   │   └── validators.ts      # Schemas Zod compartilhados
│   └── middleware.ts           # Proteção de /admin via edge middleware
├── DESAFIO.md                 # Brief original preservado
├── DECISOES.md                # Decisões de stack, escopo e IA
├── README.md                  # Este arquivo
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Referências

- [`DESAFIO.md`](./DESAFIO.md) — brief original do desafio técnico.
- [`DECISOES.md`](./DECISOES.md) — decisões de stack, escopo e uso de IA.