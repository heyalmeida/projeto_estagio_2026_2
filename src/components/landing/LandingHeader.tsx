import Link from "next/link";
import { Logo } from "@/components/Logo";

export function LandingHeader() {
  return (
    <header className="border-b border-charcoal-200/60 bg-ivory-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center" aria-label="Vestaply — ir para a página inicial">
          <Logo size="md" />
        </Link>
        <nav aria-label="Navegação principal" className="flex items-center gap-2 sm:gap-4">
          <Link href="#como-funciona" className="btn-ghost hidden sm:inline-flex">
            Como funciona
          </Link>
          <Link href="#publicar-demanda" className="btn-secondary hidden sm:inline-flex">
            Publicar demanda
          </Link>
          <Link href="/login" className="btn-ghost">
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}