/**
 * Civil-date helpers.
 *
 * HTML `<input type="date">` and most date pickers emit a `YYYY-MM-DD`
 * string. When parsed with `new Date(...)` that becomes UTC midnight.
 * Rendering that back in `America/Sao_Paulo` shifts the day backward
 * (e.g. 2026-09-10 → 09/09/2026 at 21:00 BRT).
 *
 * To avoid that, we treat dates as civil dates: parsed at 12:00 UTC so
 * the local day never shifts, and compared with "today" computed in
 * the same São Paulo wall clock. This is the only correct way to
 * treat date-only fields in a multi-timezone product.
 */

export const PT_BR_TIMEZONE = "America/Sao_Paulo";

/** ISO date part of a Date, computed in São Paulo. */
export function toLocalIsoDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: PT_BR_TIMEZONE,
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

/** Today in São Paulo, as an ISO date string ("YYYY-MM-DD"). */
export function todayInSaoPaulo(now: Date = new Date()): string {
  return toLocalIsoDate(now);
}

/**
 * Parse a civil date string ("YYYY-MM-DD") into a Date anchored at
 * 12:00 UTC. The noon offset ensures the local day stays the same in
 * every timezone west of UTC-12 and east of UTC+12.
 */
export function parseCivilDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }
  // 31-day month check is delegated to Date; invalid combinations
  // like 2026-02-30 will produce NaN at construction.
  const utc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  if (Number.isNaN(utc.getTime())) return null;
  return utc;
}

/** True if `a` is strictly before `b` (civil-date comparison). */
export function isBeforeCivil(a: Date, b: Date): boolean {
  return toLocalIsoDate(a) < toLocalIsoDate(b);
}

/** True if `a` is the same civil day as `b` (in São Paulo). */
export function isSameCivilDay(a: Date, b: Date): boolean {
  return toLocalIsoDate(a) === toLocalIsoDate(b);
}