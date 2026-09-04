/**
 * Smoke tests for the validation pipeline.
 *
 * Runs: npm run test:validation
 * (tsx scripts/test-form-validation.ts)
 *
 * Exits 0 on success, non-zero on any assertion failure.
 */

import { strict as assert } from "node:assert";
import { demandFormSchema } from "../src/lib/validators";
import { parseBrlToCents } from "../src/lib/format";
import { parseCivilDate } from "../src/lib/date";

/* ------------------------------------------------------------------ */
/* Schema                                                               */
/* ------------------------------------------------------------------ */

const future = new Date();
future.setDate(future.getDate() + 30);
const past = new Date();
past.setDate(past.getDate() - 1);

const validInput = {
  buyerName: "Maria Silva",
  email: "maria@empresa.com.br",
  companyName: "Maria Confecções",
  category: "Moda feminina",
  deliveryDate: future.toISOString().slice(0, 10),
  quantity: "100",
  sizeGrade: "P 20 · M 60 · G 20",
  targetUnitPrice: "29,90",
  notes: "Pedido urgente",
};

{
  const r = demandFormSchema.safeParse(validInput);
  assert(r.success, "Valid input should parse");
  if (r.success) {
    assert.strictEqual(r.data.quantity, 100);
    assert.strictEqual(r.data.deliveryDate.toISOString().slice(0, 10), validInput.deliveryDate);
  }
}

{
  const r = demandFormSchema.safeParse({ ...validInput, email: "not-an-email" });
  assert(!r.success, "Invalid email should reject");
}

{
  const r = demandFormSchema.safeParse({ ...validInput, deliveryDate: past.toISOString().slice(0, 10) });
  assert(!r.success, "Past date should reject");
}

{
  const r = demandFormSchema.safeParse({ ...validInput, quantity: "0" });
  assert(!r.success, "Quantity 0 should reject");
}

{
  const r = demandFormSchema.safeParse({ ...validInput, quantity: "-5" });
  assert(!r.success, "Negative quantity should reject");
}

{
  const r = demandFormSchema.safeParse({ ...validInput, quantity: "1.5" });
  assert(!r.success, "Non-integer quantity should reject");
}

{
  const r = demandFormSchema.safeParse({ ...validInput, category: "Outra" });
  assert(!r.success, "Invalid category should reject");
}

{
  const r = demandFormSchema.safeParse({ ...validInput, targetUnitPrice: "" });
  assert(r.success, "Empty targetUnitPrice is optional");
}

{
  const r = demandFormSchema.safeParse({ ...validInput, targetUnitPrice: "-5,00" });
  assert(!r.success, "Negative price should reject");
}

{
  const r = demandFormSchema.safeParse({ ...validInput, buyerName: "" });
  assert(!r.success, "Empty buyerName should reject");
}

{
  const r = demandFormSchema.safeParse({ ...validInput, notes: "x".repeat(2001) });
  assert(!r.success, "Notes too long should reject");
}

/* ------------------------------------------------------------------ */
/* parseBrlToCents                                                      */
/* ------------------------------------------------------------------ */

{
  const r = parseBrlToCents("12,50");
  assert.strictEqual(r, 1250, "12,50 → 1250 cents");
}

{
  const r = parseBrlToCents("12.50");
  assert.strictEqual(r, 1250, "12.50 → 1250 cents");
}

{
  const r = parseBrlToCents("1.234,56");
  assert.strictEqual(r, 123456, "1.234,56 → 123456 cents");
}

{
  const r = parseBrlToCents("1,234.56");
  assert.strictEqual(r, 123456, "1,234.56 → 123456 cents");
}

{
  const r = parseBrlToCents("0,01");
  assert.strictEqual(r, 1, "0,01 → 1 cent");
}

{
  const r = parseBrlToCents("0");
  assert.strictEqual(r, null, "0 → null (must be positive)");
}

{
  const r = parseBrlToCents("abc");
  assert.strictEqual(r, null, "abc → null");
}

{
  const r = parseBrlToCents("");
  assert.strictEqual(r, null, "empty → null");
}

{
  const r = parseBrlToCents("  5,00  ");
  assert.strictEqual(r, 500, "whitespace is trimmed");
}

{
  const r = parseBrlToCents("0,001");
  assert.strictEqual(r, null, "0,001 → null (more than 2 decimal places)");
}

/* ------------------------------------------------------------------ */
/* parseCivilDate                                                       */
/* ------------------------------------------------------------------ */

{
  const r = parseCivilDate("2027-02-28");
  assert(r !== null, "2027-02-28 should be valid");
}

{
  const r = parseCivilDate("2027-02-29");
  assert.strictEqual(r, null, "2027-02-29 should be invalid (not a leap year)");
}

{
  const r = parseCivilDate("2027-02-30");
  assert.strictEqual(r, null, "2027-02-30 should be invalid");
}

{
  const r = parseCivilDate("2027-04-31");
  assert.strictEqual(r, null, "2027-04-31 should be invalid");
}

{
  const r = parseCivilDate("2028-02-29");
  assert(r !== null, "2028-02-29 should be valid (2028 is a leap year)");
  if (r !== null) {
    assert.strictEqual(r.getUTCFullYear(), 2028);
    assert.strictEqual(r.getUTCMonth(), 1); // February = 1
    assert.strictEqual(r.getUTCDate(), 29);
  }
}

{
  const r = parseCivilDate("2026-09-10");
  assert(r !== null, "2026-09-10 should be valid");
  if (r !== null) {
    assert.strictEqual(r.getUTCFullYear(), 2026);
    assert.strictEqual(r.getUTCMonth(), 8); // September = 8
    assert.strictEqual(r.getUTCDate(), 10);
    // Formatted as 10/09/2026
    const day = String(r.getUTCDate()).padStart(2, "0");
    const month = String(r.getUTCMonth() + 1).padStart(2, "0");
    assert.strictEqual(`${day}/${month}/${r.getUTCFullYear()}`, "10/09/2026");
  }
}

{
  const r = parseCivilDate("2026-09-09");
  assert(r !== null, "2026-09-09 should be valid");
  if (r !== null) {
    assert.strictEqual(r.getUTCDate(), 9, "no day shift from UTC");
  }
}

{
  const r = parseCivilDate("invalid");
  assert.strictEqual(r, null, "invalid string → null");
}

{
  const r = parseCivilDate("2027-13-01");
  assert.strictEqual(r, null, "month 13 → null");
}

{
  const r = parseCivilDate("2027-00-01");
  assert.strictEqual(r, null, "month 0 → null");
}

{
  const r = parseCivilDate("2027-01-00");
  assert.strictEqual(r, null, "day 0 → null");
}

/* ------------------------------------------------------------------ */

console.log("\n✓ All assertions passed");
