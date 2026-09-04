import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { DemandForm } from "@/components/landing/DemandForm";

export default function HomePage() {
  return (
    <>
      <LandingHeader />
      <main id="conteudo">
        {/* Hero */}
        <section className="border-b border-charcoal-200/40 bg-ivory-50">
          <div className="mx-auto grid max-w-content gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-24 lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-800">
                Sourcing B2B para moda
              </p>
              <h1 className="mt-3 font-editorial text-4xl leading-tight text-charcoal-900 sm:text-5xl md:text-6xl">
                Sua demanda encontra o fornecedor certo.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-charcoal-700">
                Informe o que sua empresa precisa comprar. A equipe Vestaply
                qualifica sua demanda e prepara a conexão com fornecedores do
                atacado de moda.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="#publicar-demanda" className="btn-primary">
                  Publicar demanda
                </Link>
                <Link href="#como-funciona" className="btn-secondary">
                  Como funciona
                </Link>
              </div>
              <p className="mt-6 text-sm text-charcoal-500">
                Marketplace B2B vertical para o atacado de moda brasileiro —
                com curadoria da equipe Vestaply.
              </p>
            </div>

            {/* Compact summary card mimicking operations dashboard */}
            <aside className="card overflow-hidden">
              <div className="border-b border-charcoal-200/60 bg-ivory-100 px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                  Visão geral
                </p>
                <p className="mt-1 font-editorial text-xl text-charcoal-900">
                  Compras no atacado, sem ruído
                </p>
              </div>
              <dl className="divide-y divide-charcoal-200/60 text-sm">
                <div className="flex items-center justify-between px-6 py-4">
                  <dt className="text-charcoal-500">Modelo</dt>
                  <dd className="font-semibold text-charcoal-900">Demanda reversa</dd>
                </div>
                <div className="flex items-center justify-between px-6 py-4">
                  <dt className="text-charcoal-500">Curadoria</dt>
                  <dd className="font-semibold text-charcoal-900">Qualificação humana</dd>
                </div>
                <div className="flex items-center justify-between px-6 py-4">
                  <dt className="text-charcoal-500">Status inicial</dt>
                  <dd className="font-semibold text-amber-500">Pendente</dd>
                </div>
                <div className="flex items-center justify-between px-6 py-4">
                  <dt className="text-charcoal-500">Confirmação</dt>
                  <dd className="font-semibold text-green-800">Protocolo único</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        {/* Problem */}
        <section className="bg-white">
          <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-800">
              O problema
            </p>
            <h2 className="mt-2 font-editorial text-3xl text-charcoal-900 sm:text-4xl">
              Comprar no atacado de moda ainda é fragmentado.
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Catálogos desatualizados",
                  body: "PDFs e fotos de WhatsApp não refletem o que está em produção hoje nem o MOQ real de cada fornecedor.",
                },
                {
                  title: "Cotações lentas",
                  body: "Cada fornecedor responde em seu ritmo. Comparar preço, prazo e grade vira uma planilha paralela.",
                },
                {
                  title: "Histórico inexistente",
                  body: "Sem registro centralizado, cada nova coleção começa do zero — e a qualidade vira promessa, não garantia.",
                },
              ].map((item) => (
                <div key={item.title} className="card p-6">
                  <h3 className="font-editorial text-lg text-charcoal-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-charcoal-700">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="bg-ivory-100/60">
          <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-800">
              Como funciona
            </p>
            <h2 className="mt-2 font-editorial text-3xl text-charcoal-900 sm:text-4xl">
              Três etapas para qualificar sua demanda
            </h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Você descreve a demanda",
                  body: "Produto, quantidade, prazo, grade e referências. O formulário leva poucos minutos.",
                },
                {
                  step: "02",
                  title: "A gente qualifica",
                  body: "Nossa equipe confere os dados, ajusta especificações e identifica fornecedores compatíveis.",
                },
                {
                  step: "03",
                  title: "Conexão com fornecedores",
                  body: "Encaminhamos a demanda qualificada para atacadistas e confecções do nosso cadastro.",
                },
              ].map((item) => (
                <li key={item.title} className="card p-6">
                  <p className="font-editorial text-2xl text-green-800">{item.step}</p>
                  <h3 className="mt-3 font-editorial text-lg text-charcoal-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-charcoal-700">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-white">
          <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-800">
              Benefícios
            </p>
            <h2 className="mt-2 font-editorial text-3xl text-charcoal-900 sm:text-4xl">
              Para compradores B2B de moda
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {[
                {
                  title: "Tempo recuperado",
                  body: "Uma única fonte estruturada de demandas — sem precisar garimpar fornecedor por fornecedor.",
                },
                {
                  title: "Especificações consistentes",
                  body: "Grade, MOQ e prazo padronizados tornam a comparação entre propostas mais justa.",
                },
                {
                  title: "Protocolo de atendimento",
                  body: "Cada demanda recebe um identificador único, rastreável pela equipe e por você.",
                },
                {
                  title: "Curadoria humana",
                  body: "Nossa equipe valida cada pedido antes de encaminhar — sem despachar dados brutos para a base.",
                },
              ].map((item) => (
                <div key={item.title} className="card p-6">
                  <h3 className="font-editorial text-lg text-charcoal-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-charcoal-700">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demand form */}
        <section id="publicar-demanda" className="bg-ivory-50">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-800">
              Publicar demanda
            </p>
            <h2 className="mt-2 font-editorial text-3xl text-charcoal-900 sm:text-4xl">
              Conte o que sua empresa precisa comprar
            </h2>
            <p className="mt-3 max-w-2xl text-charcoal-700">
              Sua demanda será registrada com status <strong>pendente</strong>.
              Após o envio, você receberá um protocolo de atendimento.
            </p>
            <div className="mt-8">
              <DemandForm />
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}