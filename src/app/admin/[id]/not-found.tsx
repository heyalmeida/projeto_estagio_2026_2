import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 p-12 text-center">
      <p className="font-editorial text-xl text-charcoal-900">Demanda não encontrada</p>
      <p className="max-w-md text-sm text-charcoal-500">
        A demanda solicitada pode ter sido removida ou o link está incorreto.
      </p>
      <Link href="/admin" className="btn-secondary mt-4">
        Voltar para o painel
      </Link>
    </div>
  );
}