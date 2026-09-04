/**
 * Brazilian (pt-BR) formatters used in the UI. Server components format
 * with explicit timeZone to avoid hydration mismatches between server
 * and browser.
 */

export const PT_BR_TIMEZONE = "America/Sao_Paulo";

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: PT_BR_TIMEZONE,
  }).format(date);
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
 * Convert a real-world BRL input into integer cents.
 *
 * Accepts both pt-BR ("12,50", "1.234,56") and en ("12.50", "1,234.56")
 * formats. Returns null when the input cannot be parsed as a non-negative
 * number. Empty / whitespace-only input is treated as "not provided"
 * and returns null.
 */
export function parseBrlToCents(input: unknown): number | null {
  if (input === null || input === undefined) return null;
  const raw = String(input).trim().replace(/\s+/g, "");
  if (!raw) return null;

  // Heuristic: if both `.` and `,` are present, the last one is the
  // decimal separator. If only one is present, it's the decimal
  // separator regardless of position.
  const hasDot = raw.includes(".");
  const hasComma = raw.includes(",");

  let normalized: string;
  if (hasDot && hasComma) {
    const lastDot = raw.lastIndexOf(".");
    const lastComma = raw.lastIndexOf(",");
    if (lastComma > lastDot) {
      // pt-BR style: "1.234,56"
      normalized = raw.replace(/\./g, "").replace(",", ".");
    } else {
      // en style: "1,234.56"
      normalized = raw.replace(/,/g, "");
    }
  } else if (hasComma) {
    // "12,50" → "12.50"
    normalized = raw.replace(",", ".");
  } else {
    normalized = raw;
  }

  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;

  return Math.round(value * 100);
}