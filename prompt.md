Você está trabalhando diretamente em um fork do repositório de um teste técnico para uma vaga de estágio em desenvolvimento Full Stack.

## Contexto do repositório

Este repositório não contém uma implementação anterior do Vestaply. Ele é apenas o fork oficial usado para desenvolver e submeter o teste técnico por Pull Request.

O Vestaply será utilizado somente como:

* Tema do projeto
* Contexto de negócio
* Identidade do produto
* Fonte das regras do domínio

Toda a aplicação deve ser criada do zero dentro deste fork.

Não procure, importe, copie ou reutilize código, componentes, assets, banco de dados ou estrutura de outro projeto chamado Vestaply. Não adicione o projeto em uma subpasta: a aplicação Next.js deve ficar na raiz do repositório atual.

Antes de modificar qualquer arquivo:

1. Leia integralmente o `README.md` original.
2. Identifique todos os requisitos obrigatórios do desafio.
3. Preserve o conteúdo original em `DESAFIO.md`.
4. Depois, substitua o `README.md` por uma documentação própria da entrega.
5. Preserve o histórico Git e não altere ou remova a pasta `.git`.
6. Não crie commits automaticamente, a menos que isso seja solicitado.

## Produto

Desenvolva o **Vestaply**, um sistema B2B para captação e qualificação de demandas de compra no atacado de moda.

O conceito do Vestaply é baseado em demanda reversa: em vez de o comprador procurar vários fornecedores individualmente, ele descreve o que sua empresa precisa comprar. A equipe do Vestaply analisa e qualifica essa demanda antes de encaminhá-la para fornecedores compatíveis.

Neste teste, implemente somente o módulo de entrada e gestão das demandas. Não construa o marketplace completo.

## Escopo funcional

O sistema possui três áreas:

1. Página pública apresentando o Vestaply
2. Formulário público para cadastrar uma demanda
3. Painel administrativo protegido para gerenciar as demandas

Fluxo principal:

1. Um lojista ou representante de uma marca acessa a página pública.
2. Conhece a proposta do Vestaply.
3. Preenche o formulário com sua necessidade de compra.
4. A demanda é persistida com status `pendente`.
5. Uma confirmação visual e um protocolo são apresentados.
6. Um administrador acessa `/admin`.
7. Caso não esteja autenticado, ele é redirecionado para `/login`.
8. Após o login, visualiza as demandas ordenadas pela data desejada de entrega.
9. O administrador pode confirmar ou cancelar uma demanda.
10. O administrador pode encerrar a sessão.

## Stack

Utilize:

* Next.js 15
* App Router
* TypeScript
* React
* Server Actions
* Prisma ORM
* SQLite
* Auth.js/NextAuth com Credentials Provider
* Zod
* Tailwind CSS
* `bcryptjs`
* npm

Use versões estáveis e mutuamente compatíveis, mantendo o `package-lock.json`.

Não crie:

* API REST separada
* Backend Express
* Microsserviços
* Segundo servidor
* Docker
* Infraestrutura desnecessária

A aplicação deve ser um monólito Next.js simples de executar e explicar.

## Página pública

A página inicial deve apresentar o Vestaply como uma solução de procurement e sourcing B2B, não como uma loja ou marca de roupas.

Estrutura:

1. Header
2. Hero
3. Problema resolvido
4. Funcionamento em três etapas
5. Benefícios para compradores
6. Formulário de demanda
7. Footer

Copy inicial sugerida:

* Eyebrow: “Sourcing B2B para moda”
* Título: “Sua demanda encontra o fornecedor certo.”
* Descrição: “Informe o que sua empresa precisa comprar. A equipe Vestaply qualifica sua demanda e prepara a conexão com fornecedores do atacado de moda.”
* CTA principal: “Publicar demanda”
* CTA secundário: “Como funciona”

Não afirme que o usuário receberá propostas diretamente pela plataforma nesta versão, pois o fluxo dos fornecedores não será implementado.

Não use números de mercado ou alegações comerciais sem fonte verificável.

## Formulário

Campos obrigatórios:

* Nome do responsável pela compra
* Email corporativo
* Nome da empresa
* Categoria dos produtos
* Data desejada para entrega
* Quantidade pretendida
* Grade ou tamanhos necessários

Campos opcionais:

* Preço-alvo por unidade
* Observações sobre a demanda

Categorias permitidas:

* Moda feminina
* Moda masculina
* Moda infantil
* Fitness
* Acessórios

Validação:

* Valide todos os dados no servidor com Zod.
* O email deve ser válido.
* A data desejada não pode estar no passado.
* A quantidade deve ser um inteiro positivo.
* O preço-alvo, quando informado, deve ser positivo.
* Defina limites coerentes para todos os campos de texto.
* Não confie somente em atributos HTML.
* Mostre os erros próximos aos respectivos campos.
* Preserve os valores preenchidos quando houver erro.
* Desabilite o botão e mostre estado de envio enquanto a ação estiver sendo processada.
* Evite registros duplicados provocados por cliques repetidos.

Após uma submissão válida:

1. Persista a demanda no SQLite.
2. Force o status inicial como `pendente`, independentemente do cliente.
3. Gere um protocolo único semelhante a `VST-2026-7F3A2C`.
4. Mostre uma confirmação visual com esse protocolo.
5. Limpe o formulário somente após a confirmação do servidor.

## Banco de dados

Crie pelo menos os modelos `Admin` e `Demand`.

A demanda deve possuir:

* `id`
* `protocol`
* `buyerName`
* `email`
* `companyName`
* `category`
* `deliveryDate`
* `quantity`
* `sizeGrade`
* `targetUnitPriceCents`
* `notes`
* `status`
* `internalNotes`
* `createdAt`
* `updatedAt`

O preço-alvo deve ser convertido e armazenado em centavos como inteiro. Não utilize ponto flutuante para representar dinheiro.

O valor potencial da demanda não deve ser persistido. Calcule-o quando necessário:

`quantidade × preço-alvo por unidade`

Status aceitos:

* `pendente`
* `confirmado`
* `cancelado`

Mantenha categorias e status em uma única fonte de verdade no domínio da aplicação e valide qualquer valor recebido antes de acessar o banco.

Crie e versione as migrations do Prisma. O arquivo local do SQLite não deve entrar no Git.

## Autenticação

Implemente a autenticação administrativa com Auth.js/NextAuth e Credentials Provider.

Requisitos:

* Página de login em `/login`
* Painel em `/admin`
* Senha armazenada somente como hash
* Comparação de senha com `bcryptjs`
* Administrador criado por seed
* Credenciais do seed provenientes de variáveis de ambiente
* Redirecionamento para `/login` ao acessar `/admin` sem sessão
* Redirecionamento para `/admin` após login válido
* Logout funcional
* Mensagem genérica para credenciais inválidas

Proteja `/admin` com middleware e também faça uma verificação de sessão no layout ou página administrativa.

Toda Server Action administrativa deve verificar novamente a sessão. Nunca considere o middleware proteção suficiente para alterar dados.

Não exponha senha, hash, secret ou dados internos no cliente.

## Painel administrativo

O painel deve parecer uma ferramenta interna de operações e procurement.

Adicione:

* Header com nome do produto
* Identificação do administrador
* Botão de logout
* Resumo operacional
* Busca e filtros
* Lista de demandas
* Visualização dos detalhes
* Estado vazio
* Feedback de carregamento, sucesso e erro

Indicadores:

* Total de demandas
* Demandas pendentes
* Demandas confirmadas
* Valor potencial das demandas pendentes

Filtros:

* Busca por empresa, comprador ou protocolo
* Status
* Categoria

Ordenação:

1. Data desejada de entrega mais próxima
2. Data de criação como desempate

Cada demanda deve mostrar:

* Protocolo
* Empresa
* Responsável
* Email
* Categoria
* Quantidade
* Grade
* Data desejada
* Preço-alvo
* Valor potencial
* Status
* Data de criação

O administrador pode:

* Abrir os detalhes
* Adicionar uma observação interna
* Confirmar a demanda
* Cancelar a demanda

As alterações devem usar Server Actions, validar os valores recebidos, verificar a sessão e atualizar a página com `revalidatePath`.

Não implemente exclusão permanente.

## Design

Crie uma identidade visual corporativa, premium e minimalista. O produto deve parecer uma plataforma B2B brasileira de sourcing, não uma campanha de moda.

Direção visual:

* Fundo marfim ou off-white
* Verde profundo como cor institucional
* Verde médio e menta como apoio
* Texto em carvão
* Bordas discretas
* Espaçamento generoso
* Tipografia editorial somente nos títulos da landing page
* Tipografia sans-serif funcional no formulário e no painel
* Cards e tabelas com hierarquia clara
* Dashboard mais denso que a landing page
* Status pendente em âmbar
* Status confirmado em verde
* Status cancelado em vermelho discreto

Evite:

* Fotos de modelos
* Campanhas editoriais de roupas
* Visual de e-commerce
* Hero com vídeo
* Glassmorphism
* Gradientes roxos
* Elementos de terminal
* Estética genérica de startup de IA
* Animações excessivas
* Excesso de cards decorativos
* Componentes visuais copiados do Brezelle

A diferenciação em relação ao Brezelle deve ser evidente. O Vestaply deve comunicar compras, volume, MOQ, prazos, grades, sourcing e operação empresarial.

No desktop, apresente os registros em tabela ou listagem estruturada. No mobile, transforme-os em cards legíveis, evitando rolagem horizontal obrigatória.

Implemente:

* Contraste adequado
* Foco visível
* Labels associados corretamente
* Navegação por teclado
* Mensagens de erro acessíveis
* Layout responsivo

## Diferenciais do teste

Implemente dois diferenciais pequenos e relacionados ao negócio:

### Protocolo de atendimento

Cada demanda recebe um protocolo único após o envio. Esse protocolo também aparece no painel.

### Valor potencial

Quando o comprador informa preço-alvo, calcule:

`quantidade × preço-alvo`

Mostre o resultado nos detalhes da demanda e no resumo do painel.

Não transforme esses diferenciais em novos sistemas complexos.

## Fora do escopo

Não implemente:

* Cadastro de compradores
* Cadastro de fornecedores
* Login de compradores ou fornecedores
* Feed para fornecedores
* Envio de ofertas
* Comparação de propostas
* Match
* Chat
* Pagamentos
* Escrow
* Gestão de estoque
* Upload de arquivos
* Emails transacionais
* Integrações externas
* Múltiplos níveis de permissão

Esses itens pertencem ao produto Vestaply completo e devem ser documentados como cortes conscientes.

## Estrutura e qualidade

Mantenha o código simples o suficiente para ser compreendido e explicado por um candidato a estágio.

* Use nomes técnicos internos em inglês.
* Use português nos textos da interface.
* Separe autenticação, Prisma, validações e regras do domínio.
* Evite abstrações prematuras.
* Não crie repository pattern genérico.
* Não utilize `any`.
* Formate datas, números e valores em `pt-BR`.
* Trate erros esperados sem expor detalhes internos.
* Remova código morto, componentes não utilizados e dados falsos.
* Não implemente funcionalidades apenas para aumentar artificialmente o projeto.

## Variáveis de ambiente

Crie `.env.example` contendo:

* `DATABASE_URL`
* `AUTH_SECRET`
* `ADMIN_EMAIL`
* `ADMIN_PASSWORD`

Crie um script de seed idempotente para cadastrar ou atualizar o administrador de demonstração.

Adicione scripts npm claros para:

* Desenvolvimento
* Build
* Lint
* Geração do Prisma Client
* Migração
* Seed

## Documentação

O `README.md` final deve conter:

* Apresentação do Vestaply
* Problema de negócio
* Escopo implementado
* Stack
* Pré-requisitos
* Instalação
* Configuração do `.env`
* Migração do banco
* Seed administrativo
* Execução
* Credenciais locais de demonstração
* Scripts disponíveis
* Como testar a proteção de `/admin`
* Funcionalidades
* Limitações conhecidas
* Referência ao arquivo `DESAFIO.md`

Crie `DECISOES.md` explicando:

* O repositório é um fork do desafio técnico.
* A aplicação foi construída do zero dentro do fork.
* Somente o tema e o contexto empresarial do Vestaply foram aproveitados.
* Nenhum código de outro projeto Vestaply foi utilizado.
* Por que foi escolhido um monólito Next.js.
* Por que SQLite é adequado para avaliação local.
* Benefícios e limitações das Server Actions.
* Por que valores monetários são armazenados em centavos.
* Por que a sessão é verificada novamente nas ações administrativas.
* Por que o marketplace completo ficou fora do escopo.
* O conceito Vestaply surgiu anteriormente em um projeto acadêmico coletivo, mas esta implementação técnica é nova e individual.

Crie uma seção sobre IA com campos `TODO`, sem inventar experiências do candidato:

1. O que foi delegado à IA e o que foi feito manualmente
2. Um resultado ruim ou incorreto produzido pela IA
3. Uma decisão tomada contra uma sugestão da IA

## Verificação

Antes de finalizar:

1. Instale as dependências.
2. Valide o schema do Prisma.
3. Execute as migrations.
4. Execute o seed.
5. Rode o lint.
6. Rode o build de produção.
7. Corrija todos os erros encontrados.
8. Confirme que a demanda sempre nasce como `pendente`.
9. Confirme a ordenação pela data desejada.
10. Confirme que `/admin` redireciona visitantes para `/login`.
11. Confirme login e logout.
12. Confirme as mudanças de status.
13. Confirme o cálculo do valor potencial.
14. Teste os estados de sucesso, erro e lista vazia.
15. Verifique a interface em mobile e desktop.
16. Revise o README como se a aplicação estivesse sendo instalada em uma máquina limpa.

Ao terminar, apresente:

* Resumo do que foi implementado
* Principais arquivos criados
* Decisões relevantes
* Comandos executados
* Resultado do lint e do build
* Limitações restantes
* Sugestão de sequência de commits

Não declare que algo funciona sem ter executado a verificação correspondente.
