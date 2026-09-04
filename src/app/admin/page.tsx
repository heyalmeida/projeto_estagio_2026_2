import { listDemands, getDashboardSummary } from "@/lib/queries";
import { DEMAND_STATUS } from "@/lib/constants";
import type { DemandStatus } from "@/lib/constants";
import { SummaryCards } from "./_components/SummaryCards";
import { DemandFilters } from "./_components/DemandFilters";
import { DemandTable, EmptyState } from "./_components/DemandTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Painel",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
  }>;
}

function parseStatus(value?: string): DemandStatus | "todos" {
  if (!value || value === "todos") return "todos";
  return (DEMAND_STATUS as readonly string[]).includes(value)
    ? (value as DemandStatus)
    : "todos";
}

export default async function AdminHomePage({ searchParams }: PageProps) {
  const { q, status, category } = await searchParams;

  const summary = await getDashboardSummary();
  const demands = await listDemands({
    search: q,
    status: parseStatus(status),
    category: category && category !== "todas" ? category : "todas",
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-editorial text-2xl text-charcoal-900 sm:text-3xl">
          Demandas recebidas
        </h1>
        <p className="text-sm text-charcoal-500">
          Ordenadas pela data desejada de entrega. Use os filtros para
          refinar a busca.
        </p>
      </header>

      <SummaryCards summary={summary} />

      <DemandFilters />

      {demands.length === 0 ? (
        <EmptyState />
      ) : (
        <DemandTable demands={demands} />
      )}
    </div>
  );
}