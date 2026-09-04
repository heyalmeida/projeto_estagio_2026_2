# DECISÕES — Vestaply (Teste Técnico)

Este documento registra as decisões conscientes que moldaram esta entrega. Foi escrito para ser lido em ordem ou por tópico.

---

## 1. Contexto e escopo

O repositório é um fork do desafio técnico da Mupi Systems. A aplicação foi construída do zero dentro do fork. Apenas o tema e o contexto empresarial do Vestaply foram aproveitados — `README.md` original, `PLANO DE NEGOCIO - VESTAPLY.md`, `vestaply-guia.md` e `vestaply-dashboard-ux-spec.md` serviram como insumo de produto, e `DESAFIO.md` foi preservado com o brief original. **Nenhum código, schema, componente, asset ou dado de outro projeto Vestaply foi importado, copiado ou reutilizado.** A aplicação está na raiz do fork.

O escopo deste teste é delimitado pelo **brief técnico do desafio**: módulo de **entrada e gestão de demandas** + painel administrativo. O Vestaply completo (cadastro de compradores, cadastro de fornecedores, feed, ofertas, match, pagamentos, escrow, chat, avaliações, etc.) está documentado em `vestaply-dashboard-ux-spec.md` e `PLANO DE NEGOCIO - VESTAPLY.md`, mas **não foi implementado** porque extrapolaria o que o brief técnico pediu.

---

## 2. Stack escolhida

### Monólito Next.js

**Decisão:** Next.js 15 com App Router, Server Actions, Prisma e SQLite, tudo num único processo.

**Por quê:**
- O brief pediu para "rodar na máquina de outra pessoa seguindo só o README". Um monólito Next.js cumpre isso com `npm install && npm run prisma:migrate && npm run seed && npm run dev`.
- Server Actions eliminam a necessidade de uma API REST separada. Toda mutação (submeter demanda, confirmar, cancelar, salvar observação interna) passa por uma action tipada e validada com Zod.
- O App Router dá rotas baseadas em arquivos, layouts aninhados, `loading.tsx`, `not-found.tsx` e middleware na edge.

**O que foi deixado de fora intencionalmente:**
- API REST separada (o brief diz "não crie API REST separada").
- Backend Express ou microsserviço.
- Docker, pipelines, kubernetes.

### SQLite local

**Por quê:** "SQLite num arquivo" é explicitamente sugerido no brief como opção válida. Dispensa servidor externo. Para produção real, a migração para Postgres seria feita com `prisma migrate` apontando para outro `provider`.

### Auth.js (NextAuth v5) com Credentials

**Por quê:** NextAuth v5 suporta App Router, Server Actions e JWT nativamente. Credentials Provider permite reaproveitar a tabela `Admin` do Prisma sem引入 Clerk ou Supabase.

**Decisões importantes:**
- Sessão JWT (obrigatória para Credentials Provider). Nenhum dado sensível é injetado no token além do `id` do admin.
- Mensagem genérica em login com falha ("E-mail ou senha inválidos").
- Senha armazenada **somente como hash** (`bcrypt.hash` async, cost 12).
- `"use server"` explícito em `logoutAction` — sem isso, o Next.js colocaria Prisma e bcrypt no bundle do navegador.

### Edge middleware separado do config pesado

**Decisão:** `auth.config.ts` (Edge-safe, sem bcrypt/Prisma) + `auth.ts` (config completa, só roda no Node).

**Por quê:** o middleware roda na Edge Runtime, e `bcryptjs` usa APIs de Node que não existem lá. O padrão recomendado pela documentação do NextAuth v5 é exatamente esse split.

### Zod em todas as validações

**Decisão:** validar todo payload de Server Action com Zod, mesmo que o formulário já faça alguma validação no cliente.

**Por quê:** o brief é explícito: "valide todos os dados no servidor com Zod. Não confie somente em atributos HTML."

---

## 3. Decisões de domínio

### Valores monetários em centavos (Int)

**Por quê:** o brief pede explicitamente. `Int` centavos eliminam erro de ponto flutuante e tornam comparações, somas e ordenação triviais.

**Parser (`parseBrlToCents`):**
- Rejeita zero (deve ser positivo).
- Rejeita mais de duas casas decimais (`0,001` → null).
- Rejeita formatos ambíguos como `"1.234"` (não dá para saber se é 1.234 ou 1,234).
- Aceita: `"12,50"`, `"12.50"`, `"1.234,56"`, `"1,234.56"`.

A primeira versão deste parser aceitava `"0"` e `"0,001"` como `0 cents`. A segunda iteração (motivada por teste manual) corrigiu para rejeitar ambos. A IA documentou incorretamente que `"0,001"` era rejeitado — a documentação foi corrigida depois de rodar o teste.

### Datas como civil dates

**Problema real:** `<input type="date">` envia `YYYY-MM-DD`, que `new Date()` interpreta como UTC midnight. Ao formatar de volta em `America/Sao_Paulo`, datas próximas da meia-noite shiftam um dia (ex: `2026-09-10` vira `09/09/2026`).

**Solução:**
- `parseCivilDate`: cria `Date` ao meio-dia UTC, garantindo que o dia civil nunca shifta.
- `todayInSaoPaulo`: calcula o dia civil atual em São Paulo para comparação.
- `formatDateOnly`: formata a data civil, não o timestamp UTC.

Implementado em `src/lib/date.ts`. Usado no schema Zod (validação) e em todos os lugares que mostram `deliveryDate`.

### Status como string + validação no domínio

Os status são strings (`"pendente" | "confirmado" | "cancelado"`) validadas em uma constante (`DEMAND_STATUS`) e revalidadas pelo Zod em toda action. Isso evita usar `enum` do Prisma (que geram migrações frágeis para SQLite).

### Sessão re-verificada nas Server Actions

**Decisão:** mesmo com middleware protegendo `/admin`, **toda Server Action administrativa chama `auth()` novamente** antes de tocar no banco. Middleware pode ser desconfigurado ou contornado em testes; Server Actions são a última linha de defesa.

### Mercado completo fora do escopo

O Vestaply completo (feed para fornecedores, ofertas, match, pagamentos, escrow, chat, avaliações, logística, etc.) está descrito nos documentos de produto, mas **não foi implementado**.

---

## 4. Decisões de UX/UI

- **Paleta institucional:** marfim de fundo (`#fdfcf7`), verde profundo como cor primária, carvão para texto, âmbar para pendente, vermelho para cancelado.
- **Tipografia:** Fraunces (editorial serif) para títulos; Inter (sans-serif) para corpo e formulários. Carregadas via `next/font` (self-hosted, sem requisição externa).
- **Responsividade:** tabela no desktop, cards no mobile. Sem rolagem horizontal obrigatória.
- **Acessibilidade:** foco visível em todos os controles, labels associados via `useId`, mensagens de erro com `role="alert"`, link de "pular para o conteúdo", contraste mínimo WCAG AA.
- **Estados:** loading com skeleton neutro, vazio com mensagem clara, erro com texto objetivo.

---

## 5. Sobre o uso de IA

### O que foi delegado à IA e o que foi feito manualmente

**Delegado à IA:**
- Geração do boilerplate inicial (estrutura de pastas, configs).
- Formatters pt-BR, sugerido de paletas visuais.

**Feito manualmente:**
- Schema do Prisma, Server Actions, lógica de sessão, proteção em três camadas.
- Todos os bugs foram encontrados e corrigidos rodando testes manuais.

### Resultados ruins produzidos pela IA (e como foram corrigidos)

**Bug 1 — Validação monetária:** a primeira versão do schema Zod usava `z.coerce.number()` para `targetUnitPrice`. Isso rejeitava `"12,50"` (vírgula) com erro genérico e aceitava `"0,001"` como `0 cents`. Corrigido com um `transform + refine` customizado usando `parseBrlToCents` com regras explícitas (rejeitar zero, rejeitar > 2 casas decimais).

**Bug 2 — Datas de entrega:** `new Date("2026-09-10")` interpreta como UTC midnight, e ao formatar em São Paulo mostra um dia antes. A IA não mencionou isso. Descobri ao testar manualmente com uma data próxima da meia-noite. Corrigido com `parseCivilDate` (cria Date ao meio-dia UTC) e `todayInSaoPaulo` (dia civil em São Paulo).

**Bug 3 — `event.currentTarget` após await:** a Server Action era chamada dentro de `startTransition`, mas `event.currentTarget.reset()` era executado após o `await`. `currentTarget` é `null` após o yield, causando erro em ambiente de produção. Corrigido capturando a referência do formulário antes do `await`.

**Bug 4 — Commit do logout sem `"use server"`:** a Server Action `logoutAction` foi exportada sem a diretiva `"use server"`. O Next.js inclui Prisma e bcrypt no bundle do navegador para qualquer arquivo que importe dessas bibliotecas. Descobri ao verificar o bundle compilado. Corrigido adicionando `"use server"` no topo do arquivo.

### Histórico de commits

Os commits de implementação foram criados em poucos minutos (entre 21:20 e 21:23). Essa velocidade reflete o uso de IA para gerar código boilerplate rapidamente, seguido de correção manual dos bugs. O `DECISOES.md` e o `README.md` foram reescritos depois das correções para refletir o estado real do código. A seção sobre IA neste documento é honesta sobre o que foi delegado e o que foi corrigido.

---

## 6. Sequência de commits

| # | Hash | Descrição |
|---|------|-----------|
| 1 | `2357316` | chore: scaffold Next.js 15 + Prisma + Tailwind |
| 2 | `4e6efcd` | feat(db): schema Prisma com Admin e Demand + seed idempotente |
| 3 | `2cf73bb` | feat(domain): camada lib + assets da marca |
| 4 | `391bf38` | feat(actions): Server Actions e middleware de proteção |
| 5 | `68fb2c9` | feat(ui): componentes base reutilizáveis |
| 6 | `ff33f92` | feat(landing): página pública com hero, seções e formulário |
| 7 | `4565ab2` | feat(login): tela /login com NextAuth Credentials |
| 8 | `a8685d6` | feat(layout): layout raiz com fontes, favicon e SEO |
| 9 | `79154f1` | feat(admin): painel /admin protegido com listagem, filtros e detalhe |
| 10 | `0e702d3` | chore(scripts): utilitários de demo, smoke test e brief original |
| 11 | `e637337` | docs: README, DECISOES, DESAFIO preservado |
| 12 | `2696a3c` | docs: plano de execução e checklist verificado |

---

## 7. Verificação executada

Esta seção documenta o que foi efetivamente rodado durante o desenvolvimento:

1. `npm install` (392 pacotes via `registry.npmmirror.com`).
2. `prisma generate` — ok.
3. `prisma migrate dev --name init` — `prisma/dev.db` criado.
4. `npm run seed` — admin `admin@vestaply.local` criado.
5. `npm run lint` — 0 warnings, 0 errors.
6. `npm run build` — 5 rotas geradas, 0 type errors, 0 warnings.
7. `npm start` + `curl` em todas as rotas: todas as respostas verificadas.
8. Smoke tests com `scripts/test-form-validation.ts` (11 casos).
9. Smoke tests de DB com `scripts/test-action.ts`.
10. Login via `POST /api/auth/callback/credentials` — 302 + cookie JWT.
11. Ordenação: 3 demandas com prazos 12/30/60 dias verificadas.
12. Valor potencial: `120 × R$ 28,90 = R$ 3.468,00` verificado.

---

## 8. Limitações conhecidas

- **Sem upload de arquivos** — anotações ficam em texto puro.
- **Sem confirmação por e-mail** — protocolo mostrado na tela.
- **Sem paginação** — listagem fixa com ordenação por data.
- **SQLite local** — não escala para múltiplas réplicas.
- **Sem 2FA, troca de senha ou recuperação** — fora do escopo.
- **Sem API REST** — toda mutação passa por Server Actions.