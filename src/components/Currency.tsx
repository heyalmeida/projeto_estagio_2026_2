import { formatCurrencyFromCents } from "@/lib/format";

export function Currency({
  cents,
  emphasize = false,
}: {
  cents: number | null | undefined;
  emphasize?: boolean;
}) {
  const text = formatCurrencyFromCents(cents);
  return (
    <span className={emphasize ? "font-semibold text-charcoal-900 tabular" : "tabular"}>
      {text}
    </span>
  );
}