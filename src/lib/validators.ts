import { z } from "zod";
import { DEMAND_CATEGORIES, DEMAND_STATUS } from "./constants";
import { parseBrlToCents } from "./format";

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
 * Custom validator for the optional target unit price. Accepts the
 * string coming from the form (already in pt-BR-friendly shape),
 * converts it to integer cents and rejects negative/zero values.
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
    (value) => !value.provided || (value.cents !== null && value.cents >= 0),
    { message: "Informe um preço-alvo válido em reais (ex.: 12,50)." },
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
  // Required field: a future date. We coerce to Date so HTML inputs work.
  deliveryDate: z.coerce
    .date({ invalid_type_error: "Data desejada inválida." })
    .refine((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return value.getTime() >= today.getTime();
    }, { message: "A data desejada não pode estar no passado." }),
  quantity: z.coerce
    .number({ invalid_type_error: "Informe a quantidade desejada." })
    .int("A quantidade deve ser um número inteiro.")
    .positive("A quantidade deve ser maior que zero.")
    .max(1_000_000, "Quantidade muito alta para um único pedido."),
  sizeGrade: trimmedString(2, 240, "Grade ou tamanhos"),
  // Optional, but positive when present. Returns a { provided, cents }
  // object so the action knows whether the field was filled in.
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