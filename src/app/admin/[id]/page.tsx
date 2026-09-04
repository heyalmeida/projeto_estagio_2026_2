import Link from "next/link";
import { notFound } from "next/navigation";
import { getDemandById } from "@/lib/queries";
import { StatusBadge } from "@/components/StatusBadge";
import { Currency } from "@/components/Currency";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import type { DemandStatus } from "@/lib/constants";
import { StatusActions } from "../_components/StatusActions";
import { InternalNotesForm } from "../_components/InternalNotesForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DemandDetailPage({ params }: PageProps) {
  const { id } = await params;
  const demand = await getDemandById(id);
  if (!demand) notFound();

  const status = demand.status as DemandStatus;
  const potentialValue =
    demand.targetUnitPriceCents != null
      ? demand.targetUnitPriceCents * demand.quantity
      : null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center text-sm text-charcoal-500 hover:text-charcoal-900"
      >
        ← Voltar para a lista
      </Link>

      <header className="card flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs text-charcoal-500">{demand.protocol}</p>
          <h1 className="mt-1 font-editorial text-2xl text-charcoal-900 sm:text-3xl">
            {demand.companyName}
          </h1>
          <p className="text-sm text-charcoal-500">
            {demand.buyerName} · {demand.email}
          </p>
        </div>
        <StatusBadge status={status} />
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-editorial text-lg text-charcoal-900">Resumo da demanda</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wider text-charcoal-500">Categoria</dt>
                <dd className="mt-1 text-charcoal-900">{demand.category}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-charcoal-500">
                  Quantidade
                </dt>
                <dd className="mt-1 text-charcoal-900 tabular">
                  {formatNumber(demand.quantity)} un
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-charcoal-500">
                  Data desejada
                </dt>
                <dd className="mt-1 text-charcoal-900">
                  {formatDate(demand.deliveryDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-charcoal-500">
                  Recebida em
                </dt>
                <dd className="mt-1 text-charcoal-900">
                  {formatDateTime(demand.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-charcoal-500">
                  Preço-alvo por unidade
                </dt>
                <dd className="mt-1">
                  <Currency cents={demand.targetUnitPriceCents} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-charcoal-500">
                  Valor potencial
                </dt>
                <dd className="mt-1">
                  <Currency cents={potentialValue} emphasize />
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wider text-charcoal-500">
                  Grade / tamanhos
                </dt>
                <dd className="mt-1 whitespace-pre-line text-charcoal-900">
                  {demand.sizeGrade}
                </dd>
              </div>
              {demand.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wider text-charcoal-500">
                    Observações do comprador
                  </dt>
                  <dd className="mt-1 whitespace-pre-line text-charcoal-900">
                    {demand.notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="card p-6">
            <h2 className="font-editorial text-lg text-charcoal-900">Ações</h2>
            <p className="mt-1 text-sm text-charcoal-500">
              As alterações de status entram em vigor imediatamente.
            </p>
            <div className="mt-4">
              <StatusActions demandId={demand.id} currentStatus={status} />
            </div>
          </div>
        </div>

        <aside className="card p-6">
          <h2 className="font-editorial text-lg text-charcoal-900">
            Observação interna
          </h2>
          <p className="mt-1 text-sm text-charcoal-500">
            Anotações privadas para a equipe Vestaply. Não são exibidas ao
            comprador.
          </p>
          <div className="mt-4">
            <InternalNotesForm
              demandId={demand.id}
              initialNotes={demand.internalNotes}
            />
          </div>
        </aside>
      </section>
    </div>
  );
}