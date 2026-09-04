import { Currency } from "@/components/Currency";
import { formatNumber } from "@/lib/format";
import type { DashboardSummary } from "@/lib/queries";

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  const items = [
    {
      label: "Total de demandas",
      value: formatNumber(summary.total),
      accent: "text-charcoal-900",
    },
    {
      label: "Pendentes",
      value: formatNumber(summary.pendente),
      accent: "text-amber-500",
    },
    {
      label: "Confirmadas",
      value: formatNumber(summary.confirmado),
      accent: "text-green-800",
    },
    {
      label: "Valor potencial (pendentes)",
      value: summary.potentialValueCents > 0 ? (
        <Currency cents={summary.potentialValueCents} emphasize />
      ) : (
        "—"
      ),
      accent: "text-charcoal-900",
    },
  ];

  return (
    <section
      aria-label="Resumo operacional"
      className="grid grid-cols-2 gap-3 md:grid-cols-4"
    >
      {items.map((item) => (
        <div key={item.label} className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-charcoal-500">
            {item.label}
          </p>
          <p className={`mt-2 font-editorial text-2xl ${item.accent} tabular`}>
            {item.value}
          </p>
        </div>
      ))}
    </section>
  );
}