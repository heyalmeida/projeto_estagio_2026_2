# DECISÕES — Vestaply (Teste Técnico)

Este documento registra as decisões conscientes que moldaram esta entrega. Foi escrito para ser lido em ordem ou por tópico.

---

## 1. Contexto e escopo

O repositório é um fork do desafio técnico da Mupi Systems. A aplicação foi construída do zero dentro do fork.

Os documentos anteriores do Vestaply (`README.md` original, `PLANO DE NEGOCIO - VESTAPLY.md`, `vestaply-guia.md` e `vestaply-dashboard-ux-spec.md`) existiam como **contexto externo de produto** e não fazem parte deste repositório — nenhum código, schema, componente, asset ou dado deles foi importado, copiado ou reutilizado. O tema Vestaply e o contexto empresarial (marketplace B2B para moda) vieram desses documentos, mas a implementação técnica é inteiramente nova.

O conceito do Vestaply surgiu anteriormente em um projeto acadêmico coletivo, mas **esta implementação é nova e individual**. Nenhum código foi reaproveitado entre aquele projeto e este.

`DESAFIO.md` contém o brief original preservado do avaliador.

O escopo deste teste é delimitado pelo brief técnico: módulo de **entrada e gestão de demandas** + painel administrativo. O Vestaply completo (cadastro de compradores e fornecedores, feed, ofertas, match, pagamentos, escrow, chat, avaliações, etc.) está fora do escopo — foi implementado apenas o suficiente para validar a entrada do funil.

---

## 2. Stack escolhida

### Monólito Next.js

**Decisão:** Next.js 15 com App Router, Server Actions, Prisma e SQLite, tudo num único processo.

**O que foi ganho:**
- Um único comando instala tudo: `npm ci && npm run prisma:migrate && npm run seed && npm run dev`.
- Server Actions eliminam a necessidade de uma API REST separada. Toda mutação (submeter demanda, confirmar, cancelar, salvar observação interna) passa por uma action tipada e validada com Zod no servidor.
- O App Router dá rotas baseadas em arquivos, layouts aninhados, `loading.tsx`, `not-found.tsx` e middleware na edge.

**O que foi perdido:**
- Escalabilidade horizontal trivial: como tudo roda num único processo Next.js, separar o servidor de banco exige alteração de infraestrutura.
- Flexibilidade de front-end: Server Actions acopladas ao Next.js dificultam trocar o framework no futuro.
- Sem microsserviços, sem workers isolados para tarefas pesadas.

**Decisões de exclusão:** API REST separada, Express ou microsserviço, Docker, pipelines, Kubernetes — tudo fora do escopo deste teste.

### SQLite local

**Decisão:** `prisma/dev.db`, ignorado pelo Git.

**Ganho:** zero configuração de banco; dispensa Postgres, Docker ou serviço externo para rodar localmente.

**Perda:** não escala para produção com múltiplas réplicas; migrations Prisma com SQLite geram algumas limitações (ex: `upsert` com `ON CONFLICT` pode variar entre dialects).

### Auth.js (NextAuth v5) com Credentials Provider

**Decisão:** Credentials Provider + JWT, sem introduzir Clerk ou Supabase.

**Ganho:** reaproveita a tabela `Admin` do Prisma existente; JWT stateless dispensa banco de sessão; middleware na edge verifica todas as requisições sem rodar Prisma.

**Perda:** sessões JWT não podem ser revogadas individualmente sem invalidate-hooks; o Credentials Provider exige que o servidor de autenticação (Node runtime) valide senhas em cada action, o que seria diferente com OAuth.

**Decisões de implementação:**
- Sessão JWT: nenhum dado sensível injetado no token além do `id` do admin.
- Mensagem genérica em login com falha ("E-mail ou senha inválidos").
- `"use server"` explícito em `logoutAction` — sem isso, o Next.js inclui Prisma e bcrypt no bundle do navegador.

### Edge middleware separado do config pesado

**Decisão:** `auth.config.ts` (Edge-safe, sem bcrypt/Prisma) + `auth.ts` (config completa, só Node).

**Motivo:** middleware roda na Edge Runtime, e `bcryptjs` usa APIs de Node ausentes lá. O padrão recomendado pelo NextAuth v5 é exatamente esse split.

### Zod em todas as validações

**Decisão:** todo payload de Server Action é validado com Zod, mesmo que o formulário já valide no cliente.

**Motivo:** o brief é explícito: "valide todos os dados no servidor com Zod. Não confie somente em atributos HTML."

---

## 3. Decisões de domínio

### Valores monetários em centavos (Int)

**Decisão:** `Int` centavos em vez de `Decimal` ou `Float`.

**Motivo:** o brief pede explicitamente. Centavos como `Int` eliminam erro de ponto flutuante e tornam comparações, somas e ordenação triviais.

**Parser (`parseBrlToCents`):**
- Rejeita zero (deve ser positivo).
- Rejeita mais de duas casas decimais (`0,001` → null).
- Rejeita formatos ambíguos como `"1.234"` (não dá para saber se é 1.234 ou 1,234).
- Aceita: `"12,50"`, `"12.50"`, `"1.234,56"`, `"1,234.56"`.

### Datas como civil dates

**Problema:** `<input type="date">` envia `YYYY-MM-DD`, que `new Date()` interpreta como UTC midnight. Ao formatar de volta em `America/Sao_Paulo`, datas próximas da meia-noite shiftam um dia (ex: `2026-09-10` vira `09/09/2026`).

**Solução em `src/lib/date.ts`:**
- `parseCivilDate`: cria `Date` ao meio-dia UTC, garantindo que o dia civil nunca shifta. Também valida que os componentes UTC da data resultante coincidem com o input, rejeitando datas inexistentes como `2027-02-29` ou `2027-04-31`.
- `todayInSaoPaulo`: calcula o dia civil atual em São Paulo para comparação com a data de entrega.
- `formatDateOnly`: formata a data civil, não o timestamp UTC.

### Status como string + validação no domínio

**Decisão:** status como strings (`"pendente" | "confirmado" | "cancelado"`) validadas em `DEMAND_STATUS` e revalidadas pelo Zod em toda action.

**Motivo:** `enum` do Prisma gera migrations frágeis para SQLite.

### Sessão re-verificada nas Server Actions

**Decisão:** mesmo com middleware protegendo `/admin`, **toda Server Action administrativa chama `auth()` novamente** antes de tocar no banco.

**Motivo:** middleware pode ser contornado em testes ou desconfigurado; Server Actions são a última linha de defesa.

---

## 4. Decisões de UX/UI

- **Paleta:** marfim de fundo (`#fdfcf7`), verde profundo primário, carvão para texto, âmbar para pendente, vermelho para cancelado.
- **Tipografia:** Fraunces (editorial serif) para títulos; Inter (sans-serif) para corpo. Carregadas via `next/font` (self-hosted).
- **Responsividade:** tabela no desktop, cards no mobile.
- **Acessibilidade:** foco visível, labels associados, mensagens de erro com `role="alert"`, link "pular para o conteúdo" com destino `#conteudo` presente em todas as páginas.
- **Estados:** skeleton neutro durante loading, mensagem clara em estado vazio.

---

## 5. Sobre o uso de IA

### O que foi delegado e o que foi feito manualmente

**Delegado à IA:**
- Geração do boilerplate inicial (estrutura de pastas, configs, arquivos de configuração).
- Sugestões de paletas visuais e nomes de seções.

**Feito manualmente:**
- Schema do Prisma, Server Actions, lógica de sessão, proteção em três camadas.
- Toda decisão de produto: escopo cortado, comportamento rejeitado, funcionalidade adicionada.
- Correção de cada bug identificado.

### Um resultado ruim da IA e como foi corrigido

**Validação monetária:** a primeira versão do schema Zod usava `z.coerce.number()` para `targetUnitPrice`. Isso rejeitava `"12,50"` (vírgula) com erro genérico e aceitava `"0,001"` como `0 cents`. Uma revisão assistida por IA identificou o problema no parser e na transformação Zod. Reproduzi os casos, conferi o comportamento e apliquei correções com regras explícitas (rejeitar zero, rejeitar mais de 2 casas decimais, rejeitar formatos ambíguos).

**Reset assíncrono de formulário:** a Server Action era chamada dentro de `startTransition`, mas `event.currentTarget.reset()` era executado após o `await`. O `currentTarget` é `null` após o yield, causando erro em produção. Identificado e corrigido ao examinar o código antes de um teste funcional.

### Uma decisão contra a sugestão da IA

As primeiras sugestões de tema eram opções genéricas como submissão de beats, mentoria e residência artística. Foram rejeitadas por não transmitir o contexto corporativo desejado. O Vestaply foi escolhido como tema por representar um problema B2B mais consistente, com compradores reais e fluxos verificáveis. Nenhum código do projeto acadêmico anterior foi reutilizado — a implementação é nova e parte do zero.

---

## 6. Limitações conhecidas

- **Sem upload de arquivos** — anotações ficam em texto puro.
- **Sem confirmação por e-mail** — protocolo mostrado na tela após envio.
- **Sem paginação** — listagem retorna todos os registros (ordenados por data).
- **SQLite local** — não escala para múltiplas réplicas.
- **Sem 2FA, troca de senha ou recuperação** — fora do escopo.
- **Sem API REST** — toda mutação passa por Server Actions.
