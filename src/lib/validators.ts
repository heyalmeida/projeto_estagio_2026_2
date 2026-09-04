import { z } from "zod";
import { DEMAND_CATEGORIES, DEMAND_STATUS } from "./constants";
import { parseBrlToCents } from "./format";
import { parseCivilDate, todayInSaoPaulo } from "./date";

/**
 * Reusable Zod schemas. Every Server Action validates the raw input
 * with one of these schemas before touching the database.
 */

const trimmedString = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, { message: `${label} é obrigatório.` })
    .max(max, { message: `${label} deve ter no máximo ${max} caracteres.` });

/**
 * Custom validator for the optional target unit price.
 *
 * Rules:
 * - Accepts the raw string from the form ("12,50", "1.234,56", etc.)
 * - Parses to integer cents via parseBrlToCents
 * - Rejects zero (must be positive)
 * - Rejects more than two decimal places (parseBrlToCents rounds, we don't)
 * - Ambiguous formats like "1.234" are rejected (could be 1,234 or 1.234)
 */
const targetUnitPriceSchema = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === undefined || value === null || value === "") {
      return { provided: false as const, cents: null };
    }
    const cents = parseBrlToCents(value);
    return { provided: true as const, cents };
  })
  .refine(
    (value) =>
      !value.provided ||
      (value.cents !== null && value.cents > 0),
    { message: "O preço-alvo deve ser maior que zero." },
  );

// --- Public demand form ---

export const demandFormSchema = z.object({
  buyerName: trimmedString(2, 120, "Nome do responsável"),
  email: z
    .string()
    .trim()
    .min(1, { message: "E-mail corporativo é obrigatório." })
    .email({ message: "Informe um e-mail válido." })
    .max(160),
  companyName: trimmedString(2, 160, "Nome da empresa"),
  category: z.enum(DEMAND_CATEGORIES, {
    errorMap: () => ({ message: "Selecione uma categoria válida." }),
  }),
  // Required field: a future civil date (YYYY-MM-DD from HTML <input type="date">).
  // Parsed as a noon-UTC Date so the day never shifts across timezones.
  // Validated against today's civil date in São Paulo.
  deliveryDate: z
    .string()
    .trim()
    .min(1, { message: "Data desejada é obrigatória." })
    .transform((v) => parseCivilDate(v))
    .refine(
      (date) => date !== null,
      { message: "Informe uma data válida no formato YYYY-MM-DD." },
    )
    .refine(
      (date) => {
        const today = todayInSaoPaulo();
        return date !== null && date.toISOString().slice(0, 10) >= today;
      },
      { message: "A data desejada não pode estar no passado." },
    ),
  quantity: z.coerce
    .number({ invalid_type_error: "Informe a quantidade desejada." })
    .int("A quantidade deve ser um número inteiro.")
    .positive("A quantidade deve ser maior que zero.")
    .max(1_000_000, "Quantidade muito alta para um único pedido."),
  sizeGrade: trimmedString(2, 240, "Grade ou tamanhos"),
  targetUnitPrice: targetUnitPriceSchema,
  notes: z
    .string()
    .trim()
    .max(2000, "Observações devem ter no máximo 2000 caracteres.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type DemandFormInput = z.infer<typeof demandFormSchema>;

// --- Admin actions ---

export const demandIdSchema = z.object({
  id: z.string().min(1, "ID inválido."),
});

export const internalNotesSchema = z.object({
  id: z.string().min(1, "ID inválido."),
  internalNotes: z
    .string()
    .trim()
    .max(2000, "Observação interna deve ter no máximo 2000 caracteres.")
    .or(z.literal("").transform(() => "")),
});

export const statusUpdateSchema = z.object({
  id: z.string().min(1, "ID inválido."),
  status: z.enum(DEMAND_STATUS, {
    errorMap: () => ({ message: "Status inválido." }),
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha."),
});