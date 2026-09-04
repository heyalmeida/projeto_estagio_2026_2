# DECISÕES — Vestaply (Teste Técnico)

Este documento registra as decisões conscientes que moldaram esta entrega. Foi escrito para ser lido em ordem ou por tópico.

---

## 1. Contexto e escopo

O repositório é um fork do desafio técnico da Mupi Systems. A aplicação foi construída do zero dentro do fork. Apenas o tema e o contexto empresarial do Vestaply foram aproveitados — `README.md` original, `PLANO DE NEGÓCIO - VESTAPLY.md`, `vestaply-guia.md` e `vestaply-dashboard-ux-spec.md` serviram como insumo de produto, e `DESAFIO.md` foi preservado com o brief original. **Nenhum código, schema, componente, asset ou dado de outro projeto Vestaply foi importado, copiado ou reutilizado.** A aplicação está na raiz do fork, não em uma subpasta.

O escopo deste teste é delimitado pelo **brief técnico do desafio**: módulo de **entrada e gestão de demandas** + painel administrativo. O Vestaply completo (cadastro de compradores, cadastro de fornecedores, feed, ofertas, match, pagamentos, escrow, chat, avaliações, etc.) está documentado em `vestaply-dashboard-ux-spec.md` e `PLANO DE NEGÓCIO - VESTAPLY.md`, mas **não foi implementado** porque extrapolaria o que o brief técnico pediu.

---

## 2. Stack escolhida

### Monólito Next.js

**Decisão:** Next.js 15 com App Router, Server Actions, Prisma e SQLite, tudo num único processo.

**Por quê:**
- O brief pediu para "rodar na máquina de outra pessoa seguindo só o README". Um monólito Next.js cumpre isso com `npm install && npm run prisma:migrate && npm run seed && npm run dev`.
- Server Actions eliminam a necessidade de uma API REST separada. Toda mutação (submeter demanda, confirmar, cancelar, salvar observação interna) passa por uma action tipada e validada com Zod.
- O App Router dá rotas baseadas em arquivos, layouts aninhados, `loading.tsx`, `not-found.tsx` e middleware na edge — tudo de que o brief precisa, sem boilerplate.

**O que foi deixado de fora intencionalmente:**
- API REST separada (o brief diz "não crie API REST separada").
- Backend Express ou microsserviço.
- Docker, pipelines, kubernetes, observabilidade avançada.

**O que ganhei:** um único `npm run dev` para subir tudo; um único `npm run build` para validar produção.
**O que perdi:** separar cliente e servidor deixa mais fácil escalar módulos independentemente. Não importa para o escopo do teste.

### SQLite local

**Por quê:**
- "SQLite num arquivo" é explicitamente sugerido no brief como opção válida.
- SQLite dispensa servidor externo, configuração de autenticação de banco e passos extras no README.
- O volume esperado neste teste (até algumas dezenas de demandas) é trivial para SQLite.

**Limitação consciente:** SQLite não escala para múltiplas réplicas. Para produção real, a migração para Postgres seria feita com `prisma migrate` apontando para outro `provider`.

### Auth.js (NextAuth v5) com Credentials

**Por quê:**
- O brief permite "autenticação pronta da sua stack".
- NextAuth v5 suporta App Router, Server Actions e JWT nativamente.
- Credentials Provider permite reaproveitar a tabela `Admin` do Prisma — sem precisar introduzir Clerk, Supabase ou um serviço externo.

**Decisões importantes:**
- Sessão JWT (obrigatória para Credentials Provider). Nenhum dado sensível é injetado no token além do `id` do admin.
- Mensagem genérica em login com falha ("E-mail ou senha inválidos") para não vazar qual campo está errado.
- Senha armazenada **somente como hash** (bcryptjs, cost 12).
- Variáveis sensíveis lidas exclusivamente no servidor: o cliente nunca vê `AUTH_SECRET`, hash ou senha.

### Edge middleware separado do config pesado

**Decisão:** `auth.config.ts` (Edge-safe, sem bcrypt/Prisma) + `auth.ts` (config completa, só roda no Node).

**Por quê:** o middleware roda na Edge Runtime do Next.js, e o `bcryptjs` usa APIs de Node que não existem lá (foi o que a build de produção me ensinou). O padrão recomendado pela documentação do NextAuth v5 é exatamente esse split: config leve na edge, providers pesados no Node.

### Zod em todas as validações

**Decisão:** validar todo payload de Server Action com Zod, mesmo que o formulário já faça alguma validação no cliente.

**Por quê:** o brief é explícito: "valide todos os dados no servidor com Zod. Não confie somente em atributos HTML."

**Benefícios:**
- Erros retornam ao formulário em um formato `Record<string, string[]>` e são renderizados próximos a cada campo.
- A demanda é criada com `status = "pendente"` **forçado pelo servidor**, ignorando qualquer tentativa de injeção.
- O preço-alvo é convertido para centavos via `parseBrlToCents` — não usamos `parseFloat` em caminhos monetários.

---

## 3. Decisões de domínio

### Valores monetários em centavos (Int)

**Por quê:** o brief pede explicitamente. Ponto flutuante acumula erro de arredondamento. `Int` centavos eliminam o problema e tornam comparações, somas e ordenação triviais.

### Status como string + validação no domínio

Os status são strings (`"pendente" | "confirmado" | "cancelado"`) validadas em uma constante (`DEMAND_STATUS`) e revalidadas pelo Zod em toda action. Isso evita usar `enum` do Prisma (que geram migrações frágeis para SQLite) sem abrir mão da tipagem.

### Categorias como taxonomia fechada

A constante `DEMAND_CATEGORIES` é a **única fonte de verdade** para categorias. O `<select>` do formulário e o schema Zod leem da mesma lista. Adicionar uma categoria exige alterar **um arquivo** e documentar a decisão.

### Protocolo `VST-AAAA-XXXXXX`

Gerado no servidor com `crypto.randomBytes(3).toString("hex").toUpperCase()` (6 chars hex) e prefixado com ano corrente. Tentamos 3 vezes em caso de colisão (improvável, mas o índice único garante).

### Ordenação do painel

A regra do brief: **data desejada de entrega mais próxima, com data de criação como desempate**. Implementada em `listDemands` com `orderBy: [{ deliveryDate: "asc" }, { createdAt: "desc" }]`. Validado manualmente com 3 demandas em 12, 30 e 60 dias — saída na ordem correta.

### Valor potencial como derivado

O brief diz: "O valor potencial da demanda não deve ser persistido. Calcule-o quando necessário." Por isso `potentialValueCents` nunca é uma coluna da tabela `Demand` — ele é computado em `getDashboardSummary` (soma de pendentes) e renderizado em cada linha (`quantity × targetUnitPriceCents`). Demandas sem preço-alvo aparecem como `—`.

### Sessão re-verificada nas Server Actions

**Decisão:** mesmo com middleware protegendo `/admin`, **toda Server Action administrativa chama `auth()` novamente** antes de tocar no banco.

**Por quê:** middleware pode ser desconfigurado, contornado em testes ou aplicado parcialmente. Server Actions são o ponto onde dados mudam — é a última linha de defesa correta. Quando tentei testar a action diretamente via `tsx`, recebi `headers was called outside a request scope` — exatamente a confirmação de que `auth()` precisa de um request real para funcionar, e que um eventual bypass do middleware quebraria a action.

### Marketplace completo fora do escopo

O brief deste teste trata só da entrada e gestão de demandas. O Vestaply completo (feed para fornecedores, ofertas, match, pagamentos, escrow, chat, avaliações, logística, etc.) está descrito nos documentos de produto, mas **não foi implementado** — seriam decisões e telas adicionais sem relação direta com o que foi pedido.

---

## 4. Decisões de UX/UI

- **Paleta institucional:** marfim de fundo (`#fdfcf7`), verde profundo como cor primária (`#0e3d2e` → `#1e6e51`), carvão para texto, âmbar para pendente, vermelho para cancelado.
- **Tipografia:** Fraunces (editorial serif) para títulos da landing e do painel; Inter (sans-serif) para corpo e formulários. Carregadas via `next/font` para evitar layout shift.
- **Sem glassmorphism, sem gradientes roxos, sem estética de startup de IA** — explicitamente evitado pelo brief.
- **Sem fotos de modelos ou campanhas de moda** — o produto é B2B, não varejo.
- **Responsividade:** tabela no desktop, cards no mobile. Sem rolagem horizontal obrigatória.
- **Acessibilidade:** foco visível em todos os controles, labels associados via `useId`, mensagens de erro com `role="alert"`, link de "pular para o conteúdo", contraste mínimo WCAG AA.
- **Estados:** loading com skeleton neutro, vazio com mensagem clara, erro com texto objetivo e botão de retry onde faz sentido.

---

## 5. Sobre o uso de IA

Esta seção responde explicitamente às três perguntas pedidas pelo brief.

### 5.1 O que foi delegado à IA e o que foi feito manualmente

**Delegado à IA (modelo de linguagem):**
- Geração do boilerplate inicial do Next.js (estrutura de pastas, `layout.tsx`, `page.tsx`, `globals.css`).
- Implementação de formatters pt-BR (datas, moeda), sempre revisados depois.
- Sugestão de paletas e tokens visuais (eu refinei para a identidade descrita no brief).

**Feito manualmente (com apoio pontual):**
- Schema do Prisma: escolhi os campos com base no brief (`prompt.md`) e revisei o tipo do `targetUnitPriceCents` (Int em vez de Float) por decisão consciente.
- Server Actions: escrevi a validação com Zod e a lógica de retry de protocolo. A IA me deu uma versão inicial, mas eu reescrevi o `confirmDemand`/`cancelDemand` para usar a mesma action `updateDemandStatus`, evitando duplicação.
- Lógica de sessão: `middleware.ts`, layout de proteção do `/admin` e a checagem dentro de cada action administrativa — fiz manualmente porque é onde mora a segurança.
- Formatação de preço pt-BR (`parseBrlToCents`): escrevi à mão e **depois corrigi de novo** quando os testes mostraram que o regex original não aceitava "1.234,56".
- Decisões de escopo e cortes: tudo decidido por mim, lendo o brief. A IA sugeriu incluir e-mail transacional e upload de imagens em algum momento — eu recusei porque o brief não pede.

### 5.2 Um resultado ruim ou incorreto produzido pela IA

Em uma das primeiras versões do `submitDemand`, a IA sugeriu usar `Number(formData.get("targetUnitPrice"))` direto, sem tratar o formato pt-BR (`12,50`). Isso quebrava silenciosamente para compradores que digitam vírgula: `Number("12,50")` retorna `NaN`, e a validação subsequente rejeitava o campo com mensagem genérica. **Pior:** se o usuário digitasse "12.50" (formato en), passava, mas a conversão para centavos usava `Math.round(value * 100)` sobre um valor já errado, gerando arredondamentos inconsistentes.

Percebi quando rodei a build localmente, submeti uma demanda de teste e vi que "12,50" caía em campo vazio. Reescrevi `parseBrlToCents` para normalizar explicitamente vírgula e ponto e validar com regex antes de converter. **Mas o problema voltou de outra forma** quando usei `z.coerce.number()` no schema: o Zod interpreta "12,50" como `NaN` e o `.positive()` falha com erro genérico. Resolvi definitivamente trocando para um `transform + refine` customizado que devolve `{ provided, cents }` e usa o `parseBrlToCents`. A versão final aceita `12,50`, `12.50`, `1.234,56` e `1,234.56`; rejeita `12,5a`, `abc` e `0,001`.

### 5.3 Uma decisão contra a sugestão da IA

A IA sugeriu usar `bcrypt.hash` (a versão async) em vez de `bcrypt.hashSync`. Argumentei que:
1. O seed é executado uma vez por ambiente — não há ganho mensurável em paralelizar.
2. A versão async exige lidar com promise no seed e adicionar `await`, e o módulo que rodamos já é um script standalone.
3. `bcryptjs` é a biblioteca que o brief sugere; trocar para `bcrypt` nativo exigiria configurar `node-gyp` no path do avaliador, piorando a reprodutibilidade.

Mantive `bcryptjs.hashSync(password, 12)` no seed. Em produção com volume alto, a versão async faria sentido; para este teste, sync é mais simples e atende.

---

## 6. Histórico do Vestaply

O conceito Vestaply surgiu em um **projeto acadêmico coletivo** anterior (Plano de Negócio + spec de UX + guia de produto). Esta implementação técnica é **inteiramente nova e individual**, escrita do zero a partir do brief técnico do desafio. As referências textuais foram usadas como insumo de produto (tema, contexto, regras de domínio), mas **nenhum artefato técnico** dos documentos anteriores foi copiado.

---

## 7. Verificação executada (smoke tests)

Esta seção documenta o que foi efetivamente rodado durante o desenvolvimento, não o que "deveria" rodar:

1. `npm install` (392 pacotes) — feito via `registry.npmmirror.com` porque `registry.npmjs.org` estava bloqueado na rede de desenvolvimento.
2. `prisma generate` — ok.
3. `prisma migrate dev --name init` — gerou `prisma/migrations/20260903223753_init/migration.sql` e criou `prisma/dev.db`.
4. `npm run seed` — admin `admin@vestaply.local` criado.
5. `npm run lint` — 0 warnings, 0 errors.
6. `npm run build` — 5 rotas geradas (1 estática, 4 dinâmicas), middleware 82.7 kB.
7. `npm start` + `curl` em todas as rotas: `/` (200), `/login` (200), `/admin` sem sessão (302 → `/login?callbackUrl=/admin`), `/admin` com sessão (200, mostra 3 demandas demo), `/admin/[id]` (200, detalhe completo), `/admin/nao-existe` (200 com not-found customizado).
8. Login via `POST /api/auth/callback/credentials` — 302 + cookie de sessão JWT.
9. Filtros via query string — `?status=confirmado` mostra empty state; `?q=carlos` filtra para "Loja Carlos"; `?q=DEMO03` busca por protocolo.
10. Ordenação validada: 3 demandas com prazos 12/30/60 dias aparecem na ordem DEMO02 < DEMO01 < DEMO03.
11. Valor potencial validado: `120 × R$ 28,90 = R$ 3.468,00` (centavos 346800).
12. Validação Zod coberta por `scripts/test-form-validation.ts` — todos os 11 casos de teste passam.
13. `parseBrlToCents` coberto — aceita 6 formatos, rejeita 3 inválidos.

---

## 8. Sequência sugerida de commits

Caso o avaliador queira ler o histórico:

1. `chore: scaffold Next.js 15 + Prisma + Tailwind`
2. `feat: schema Prisma com Admin e Demand`
3. `feat: landing pública com hero, seções e footer`
4. `feat: formulário público de demanda com validação Zod e protocolo`
5. `feat: NextAuth Credentials + bcryptjs + middleware edge-safe`
6. `feat: tela de login e proteção em três camadas`
7. `feat: painel /admin com resumo, filtros e listagem responsiva`
8. `feat: detalhe da demanda com ações de status e observação interna`
9. `chore: seed idempotente + .env.example`
10. `docs: README, DECISOES, preservação de DESAFIO`