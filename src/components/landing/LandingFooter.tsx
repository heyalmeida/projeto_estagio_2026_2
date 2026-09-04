import { Logo } from "@/components/Logo";

export function LandingFooter() {
  return (
    <footer className="mt-24 border-t border-charcoal-200/60 bg-ivory-100/60">
      <div className="mx-auto grid max-w-content gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-3">
          <Logo size="md" />
          <p className="text-sm text-charcoal-500">
            Sourcing B2B para o atacado de moda brasileiro. Compradores descrevem,
            a equipe Vestaply qualifica e conecta com fornecedores.
          </p>
        </div>
        <div className="text-sm">
          <h2 className="mb-3 font-semibold text-charcoal-900">Produto</h2>
          <ul className="space-y-1.5 text-charcoal-500">
            <li>Demanda reversa</li>
            <li>Qualificação manual</li>
            <li>Conexão com fornecedores</li>
          </ul>
        </div>
        <div className="text-sm">
          <h2 className="mb-3 font-semibold text-charcoal-900">Contato</h2>
          <ul className="space-y-1.5 text-charcoal-500">
            <li>contato@vestaply.com.br</li>
            <li>São Paulo — SP</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-charcoal-200/60 px-4 py-4 text-center text-xs text-charcoal-400 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Vestaply. Marketplace B2B de moda.
      </div>
    </footer>
  );
}