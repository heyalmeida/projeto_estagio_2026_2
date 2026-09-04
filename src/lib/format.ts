/**
 * Brazilian (pt-BR) formatters. Server components format with an
 * explicit timeZone to avoid hydration mismatches between server and
 * browser.
 *
 * Date-only fields (delivery date) are rendered via `toLocalIsoDate`
 * first to guarantee the day shown matches the day stored, regardless
 * of the viewer's timezone.
 */

import { PT_BR_TIMEZONE, toLocalIsoDate } from "./date";

export { PT_BR_TIMEZONE };

export function formatDateOnly(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const iso = toLocalIsoDate(value);
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: PT_BR_TIMEZONE,
  }).format(date);
}

export function formatCurrencyFromCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  const value = cents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR").format(value);
}

/**
 * Convert a real-world BRL string into integer cents.
 *
 * Rules applied in order:
 * 1. Whitespace-only → null.
 * 2. Zero (0, 0,0, 0,00) → null (must be positive).
 * 3. More than 2 decimal places → null (would round to a different value).
 * 4. Ambiguous "thousands-only" formats like "1.234" → null (can't tell if
 *    the period is a thousands separator or decimal point in isolation).
 * 5. Valid formats: "12,50", "12.50", "1.234,56", "1,234.56".
 *
 * Returns null for any unparseable or invalid input.
 */
export function parseBrlToCents(input: unknown): number | null {
  if (input === null || input === undefined) return null;
  const raw = String(input).trim().replace(/\s+/g, "");
  if (!raw) return null;

  const hasDot = raw.includes(".");
  const hasComma = raw.includes(",");

  let normalized: string;
  if (hasDot && hasComma) {
    // Both separators present: last one is the decimal separator.
    const lastDot = raw.lastIndexOf(".");
    const lastComma = raw.lastIndexOf(",");
    if (lastComma > lastDot) {
      // pt-BR style: "1.234,56" → remove periods, replace comma with dot
      normalized = raw.replace(/\./g, "").replace(",", ".");
    } else {
      // en style: "1,234.56" → remove commas
      normalized = raw.replace(/,/g, "");
    }
  } else if (hasComma) {
    // Only a comma: "12,50" → replace with dot
    normalized = raw.replace(",", ".");
  } else if (hasDot) {
    // Only a period: "12.50" or "1.234" (ambiguous when no comma).
    // "1.234" → ambiguous (could be 1.234 or 1,234). Reject.
    // We detect this by checking if the part after the dot has exactly 1 or 2
    // digits (decimal) vs 3 digits (likely thousands separator in pt-BR).
    const dotIdx = raw.indexOf(".");
    const after = raw.slice(dotIdx + 1);
    if (after.length === 3 && /^\d{3}$/.test(after)) {
      // "1.234" with 3 digits after the dot — ambiguous, likely thousands.
      // Accept it as "1234.00" (period = thousands), but reject because
      // that makes it 123400 cents and may not be the user's intent.
      // Safer to reject so the user types "1.234,00" or "1,234.00" instead.
      return null;
    }
    normalized = raw;
  } else {
    normalized = raw;
  }

  // Must be digits with at most one decimal point.
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;

  // Must be strictly positive.
  if (value <= 0) return null;

  // Must not have more than 2 decimal places (would change after rounding).
  const decimalIdx = normalized.indexOf(".");
  if (decimalIdx !== -1) {
    const decimals = normalized.slice(decimalIdx + 1);
    if (decimals.length > 2) return null;
  }

  return Math.round(value * 100);
}