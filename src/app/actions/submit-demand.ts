"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { demandFormSchema } from "@/lib/validators";
import { DEFAULT_DEMAND_STATUS } from "@/lib/constants";
import { generateProtocol } from "@/lib/protocol";

export type SubmitDemandResult =
  | { ok: true; protocol: string }
  | { ok: false; fieldErrors: Record<string, string[]>; message?: string };

/**
 * Public Server Action: persist a new demand with status "pendente".
 *
 * - Re-validates every field with Zod on the server.
 * - Forces the status to "pendente" regardless of any client payload.
 * - Generates a unique protocol. Retries on the (extremely unlikely)
 *   collision using Prisma's unique constraint.
 * - Returns field errors so the form can keep the user input.
 */
export async function submitDemand(
  _prev: unknown,
  formData: FormData,
): Promise<SubmitDemandResult> {
  const raw = {
    buyerName: formData.get("buyerName"),
    email: formData.get("email"),
    companyName: formData.get("companyName"),
    category: formData.get("category"),
    deliveryDate: formData.get("deliveryDate"),
    quantity: formData.get("quantity"),
    sizeGrade: formData.get("sizeGrade"),
    targetUnitPrice: formData.get("targetUnitPrice") ?? "",
    notes: formData.get("notes") ?? "",
  };

  const parsed = demandFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") {
        (fieldErrors[key] ??= []).push(issue.message);
      }
    }
    return {
      ok: false,
      fieldErrors,
      message: "Revise os campos destacados e tente novamente.",
    };
  }

  const data = parsed.data;
  const targetUnitPriceCents = data.targetUnitPrice.provided
    ? data.targetUnitPrice.cents
    : null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const protocol = generateProtocol();
    try {
      await prisma.demand.create({
        data: {
          protocol,
          buyerName: data.buyerName,
          email: data.email.toLowerCase(),
          companyName: data.companyName,
          category: data.category,
          deliveryDate: data.deliveryDate,
          quantity: data.quantity,
          sizeGrade: data.sizeGrade,
          targetUnitPriceCents,
          notes: data.notes ?? null,
          status: DEFAULT_DEMAND_STATUS,
        },
      });

      revalidatePath("/");

      return { ok: true, protocol };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint failed") &&
        attempt < 2
      ) {
        continue;
      }
      throw error;
    }
  }

  return {
    ok: false,
    fieldErrors: {},
    message: "Não conseguimos gerar um identificador único. Tente novamente em instantes.",
  };
}