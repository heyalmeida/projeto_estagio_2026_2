import { randomBytes } from "node:crypto";
import { PROTOCOL_PREFIX } from "./constants";

/**
 * Generate a protocol like `VST-2026-7F3A2C`.
 *
 * Uses crypto.randomBytes for cryptographic randomness. The format
 * guarantees the current year + 6 uppercase hex chars.
 */
export function generateProtocol(now: Date = new Date()): string {
  const year = now.getFullYear();
  const bytes = randomBytes(3).toString("hex").toUpperCase();
  return `${PROTOCOL_PREFIX}-${year}-${bytes}`;
}

export function isValidProtocol(value: unknown): value is string {
  return typeof value === "string" && /^VST-\d{4}-[A-Z0-9]{6}$/.test(value);
}