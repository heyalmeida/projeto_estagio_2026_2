import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { Currency } from "@/components/Currency";
import { formatDateOnly, formatNumber } from "@/lib/format";
import { DEFAULT_DEMAND_STATUS } from "@/lib/constants";
import type { DemandStatus } from "@/lib/constants";

interface Row {
  id: string;
  protocol: string;
  companyName: string;
  buyerName: string;
  email: string;
  category: string;
  quantity: number;
  deliveryDate: Date;
  createdAt: Date;
  targetUnitPriceCents: number | null;
  status: string;
}

export function DemandTable({ demands }: { demands: Row[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-lg border border-charcoal-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-charcoal-200 text-sm">
            <thead className="bg-ivory-100/60 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              <tr>
                <th className="px-4 py-3">Protocolo</th>
                <th className="px-4 py-3">Empresa / Comprador</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Qtd.</th>
                <th className="px-4 py-3">Prazo</th>
                <th className="px-4 py-3 text-right">Preço-alvo</th>
                <th className="px-4 py-3 text-right">Valor potencial</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-200/60">
              {demands.map((demand) => {
                const potential =
                  demand.targetUnitPriceCents != null
                    ? demand.targetUnitPriceCents * demand.quantity
                    : null;
                return (
                  <tr key={demand.id} className="hover:bg-ivory-50/40">
                    <td className="px-4 py-3 font-mono text-xs text-charcoal-900">
                      {demand.protocol}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-charcoal-900">
                        {demand.companyName}
                      </p>
                      <p className="text-xs text-charcoal-500">{demand.buyerName}</p>
                    </td>
                    <td className="px-4 py-3 text-charcoal-700">{demand.category}</td>
                    <td className="px-4 py-3 text-right tabular text-charcoal-900">
                      {formatNumber(demand.quantity)}
                    </td>
                    <td className="px-4 py-3 text-charcoal-700">
                      {formatDateOnly(demand.deliveryDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Currency cents={demand.targetUnitPriceCents} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Currency cents={potential} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={demand.status as DemandStatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/${demand.id}`}
                        className="text-sm font-medium text-green-800 underline-offset-2 hover:underline"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <ul className="space-y-3 md:hidden">
        {demands.map((demand) => {
          const potential =
            demand.targetUnitPriceCents != null
              ? demand.targetUnitPriceCents * demand.quantity
              : null;
          return (
            <li key={demand.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-charcoal-500">
                    {demand.protocol}
                  </p>
                  <p className="mt-1 font-medium text-charcoal-900">
                    {demand.companyName}
                  </p>
                  <p className="text-xs text-charcoal-500">{demand.buyerName}</p>
                </div>
                <StatusBadge status={demand.status as DemandStatus} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-charcoal-500">Categoria</dt>
                  <dd className="text-charcoal-900">{demand.category}</dd>
                </div>
                <div>
                  <dt className="text-xs text-charcoal-500">Quantidade</dt>
                  <dd className="text-charcoal-900 tabular">
                    {formatNumber(demand.quantity)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-charcoal-500">Prazo</dt>
                  <dd className="text-charcoal-900">
                    {formatDateOnly(demand.deliveryDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-charcoal-500">Preço-alvo</dt>
                  <dd>
                    <Currency cents={demand.targetUnitPriceCents} />
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-charcoal-500">Valor potencial</dt>
                  <dd className="text-charcoal-900">
                    <Currency cents={potential} emphasize />
                  </dd>
                </div>
              </dl>
              <Link
                href={`/admin/${demand.id}`}
                className="btn-secondary mt-4 w-full justify-center"
              >
                Abrir detalhes
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function EmptyState() {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 p-12 text-center">
      <p className="font-editorial text-xl text-charcoal-900">
        Nenhuma demanda por aqui ainda.
      </p>
      <p className="max-w-md text-sm text-charcoal-500">
        Quando um comprador publicar uma demanda na landing page, ela aparecerá
        aqui com status <strong>pendente</strong>. Você pode ajustar filtros
        acima para refinar a busca.
      </p>
    </div>
  );
}

export { DEFAULT_DEMAND_STATUS };