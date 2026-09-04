import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Entrar",
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Vestaply — voltar para a página inicial">
            <Logo size="lg" />
          </Link>
        </div>
        <div className="card p-8">
          <h1 className="font-editorial text-2xl text-charcoal-900">Acesso administrativo</h1>
          <p className="mt-2 text-sm text-charcoal-500">
            Entre com suas credenciais para gerenciar as demandas recebidas.
          </p>
          <div className="mt-6">
            <LoginForm callbackUrl={safeCallback} />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-charcoal-500">
          <Link href="/" className="underline-offset-2 hover:underline">
            Voltar para a página inicial
          </Link>
        </p>
      </div>
    </div>
  );
}