# Vestaply

> Marketplace B2B vertical para o atacado de moda brasileiro — focado em captação e qualificação de demandas de compra.

![Vestaply](public/logo.png)

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
| Formulário | Validação de todos os campos com Zod no servidor, status sempre `pendente`, protocolo `VST-AAAA-XXXXXX`, confirmação visual com protocolo. |
| Login | Credenciais com bcryptjs, sessão JWT, redirecionamento para `/admin` em sucesso. |
| Painel `/admin` | Resumo operacional (totais, valor potencial), busca, filtros por status e categoria, listagem responsiva (tabela no desktop, cards no mobile), ordenação por data desejada de entrega. |
| Detalhe `/admin/[id]` | Confirmação, cancelamento e reabertura como pendente; observação interna privada; valor potencial calculado. |
| SEO/Identidade | Favicon (`favicon.ico`) e logo (`/public/logo.png`) servidos pelo Next, com tags `og:` e `twitter:card` configuradas. |

---

## Stack

- **Next.js 15** com App Router e Server Actions
- **TypeScript** em modo `strict`
- **Prisma 5** + **SQLite** local (arquivo `prisma/dev.db`, ignorado pelo Git)
- **Auth.js (NextAuth v5)** com Credentials Provider e sessões JWT
- **Zod** para validação de payloads no servidor
- **bcryptjs** para hash de senha
- **Tailwind CSS v3** com paleta institucional (verde profundo + marfim)
- **next/font** com Fraunces (editorial) e Inter (sans-serif)

Tudo num único monólito Next.js, sem API REST separada, sem backend Express e sem microsserviços.

---

## Pré-requisitos

- **Node.js 20.x ou 22.x**
- **npm 10+**

---

## Instalação

```bash
# 1. Instale as dependências
npm install

# 2. Copie o arquivo de exemplo de variáveis de ambiente
cp .env.example .env

# 3. Gere um AUTH_SECRET novo (opcional mas recomendado)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Cole o resultado na variável AUTH_SECRET do .env
```

A `DATABASE_URL` já aponta para `prisma/dev.db` (SQLite local). O arquivo de banco de dados **não é versionado**.

> **Nota sobre o registro npm:** se a sua rede bloquear `registry.npmjs.org`, use o mirror `npm config set registry https://registry.npmmirror.com/`. O `package-lock.json` deste repositório foi gerado a partir desse mirror, mas o `package.json` permanece compatível com o registry oficial — basta restaurar o `registry` padrão após a instalação.

---

## Migração e seed

```bash
# Cria o banco SQLite local e aplica todas as migrations
npm run prisma:migrate -- --name init

# Cria o administrador de demonstração (idempotente)
npm run seed
```

O seed usa as credenciais definidas em `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Para o avaliador, o `.env.example` traz um par já configurado:

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

---

## Como testar a proteção de `/admin`

1. Abra uma aba anônima e acesse `http://localhost:3000/admin`.
2. Você será redirecionado para `/login?callbackUrl=/admin`.
3. Faça login com `admin@vestaply.local` / `vestaply-admin-2026`.
4. Você retornará ao `/admin` autenticado.
5. Clique em **Sair** para encerrar a sessão — o cookie JWT é destruído e `/admin` passa a redirecionar novamente.

A verificação acontece em três camadas: **middleware** (edge), **layout** do `/admin` e **dentro de cada Server Action administrativa** (defesa em profundidade).

---

## Funcionalidades

- [x] Página pública com seções: header, hero, problema, como funciona, benefícios, formulário, footer.
- [x] Formulário com validação no servidor (Zod) e no cliente.
- [x] Persistência com status `pendente` forçado pelo servidor.
- [x] Geração de protocolo `VST-AAAA-XXXXXX` único.
- [x] Confirmação visual com protocolo.
- [x] Login com credenciais (bcryptjs + JWT).
- [x] Painel com resumo operacional (totais, valor potencial).
- [x] Busca textual e filtros por status e categoria.
- [x] Listagem responsiva (tabela no desktop, cards no mobile).
- [x] Ordenação por data desejada de entrega.
- [x] Confirmação e cancelamento de demanda com Server Actions.
- [x] Reabrir demanda como pendente.
- [x] Observação interna privada (somente equipe Vestaply).
- [x] Cálculo de valor potencial (`quantidade × preço-alvo`).
- [x] Logout funcional.
- [x] Estado vazio no painel quando não há demandas.
- [x] Estados de loading com skeleton.
- [x] Acessibilidade básica: foco visível, labels associados, mensagens de erro com `role="alert"`, pular para o conteúdo.
- [x] Favicon e Open Graph configurados.

---

## Limitações conhecidas

- **Sem upload de arquivos** — o brief original do desafio não exige. Anotações ficam em texto puro.
- **Sem confirmação de leitura** — não enviamos e-mail; o comprador recebe o protocolo na tela.
- **Sem paginação** — listagem fixa com até 50 demandas filtradas. Para volumes maiores, a próxima iteração deveria paginar.
- **SQLite local** — adequado para a avaliação, mas não para múltiplas réplicas em produção.
- **Sem 2FA, troca de senha ou recuperação** — fora do escopo.
- **Sem API REST** — toda mutação passa por Server Actions.

Itens fora do escopo do Vestaply completo (marketplace com fornecedores, ofertas, match, pagamentos, chat) estão documentados em [`DECISOES.md`](./DECISOES.md).

---

## Estrutura do projeto

```
.
├── prisma/
│   ├── schema.prisma          # Modelos Admin e Demand
│   ├── seed.ts                # Seed idempotente do administrador
│   └── migrations/            # Versionadas, geradas por prisma migrate
├── public/
│   ├── favicon.ico            # Ícone multi-tamanho (16/32/48)
│   └── logo.png               # Logo principal (1920x1080)
├── scripts/
│   ├── seed-demo.ts           # 3 demandas de demonstração
│   ├── test-action.ts         # Smoke test de update/cancel/notas
│   ├── test-form-validation.ts# Smoke test do schema Zod e parseBrlToCents
│   └── list-ids.ts            # Lista IDs+protocolos+status das demandas
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
│   │   ├── layout.tsx         # Layout raiz com fontes, favicon e a11y
│   │   └── page.tsx           # Landing pública
│   ├── components/            # Logo, badges, inputs, currency
│   ├── lib/
│   │   ├── auth.config.ts     # NextAuth Edge-safe (sem bcrypt)
│   │   ├── auth.ts            # NextAuth config completa
│   │   ├── constants.ts       # Status e categorias canônicos
│   │   ├── format.ts          # Formatadores pt-BR + BRL cents
│   │   ├── prisma.ts          # Singleton do PrismaClient
│   │   ├── protocol.ts        # Gerador de protocolo
│   │   ├── queries.ts         # Consultas do painel
│   │   └── validators.ts      # Schemas Zod compartilhados
│   └── middleware.ts          # Proteção de /admin via edge middleware
├── DESAFIO.md                 # Brief original preservado
├── DECISOES.md                # Decisões de stack, escopo e IA
├── README.md                  # Este arquivo
├── implementation_plan.md     # Plano de execução
├── task.md                    # Checklist de tarefas
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Referências

- [`DESAFIO.md`](./DESAFIO.md) — brief original do desafio técnico.
- [`DECISOES.md`](./DECISOES.md) — decisões de stack, escopo e uso de IA.
- `PLANO DE NEGÓCIO - VESTAPLY.md` — plano de negócio original (tema do projeto).
- `vestaply-guia.md` — guia de produto do Vestaply.
- `vestaply-dashboard-ux-spec.md` — spec de UX do dashboard completo (fora do escopo deste teste).