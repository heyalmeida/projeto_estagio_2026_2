"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { internalNotesSchema, statusUpdateSchema } from "@/lib/validators";
import type { DemandStatus } from "@/lib/constants";

export type AdminActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

/**
 * Helper: every admin action MUST verify the session again. Middleware
 * is a safety net, not a substitute. A missing/invalid session fails
 * closed with a generic error.
 */
async function requireAdmin(): Promise<AdminActionResult | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." };
  }
  return null;
}

/**
 * Update the status of a demand. Returns a typed result so the UI can
 * render success/error messages without a page reload.
 */
export async function updateDemandStatus(
  _prev: unknown,
  formData: FormData,
): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const parsed = statusUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Dados inválidos.",
      fieldErrors: { status: ["Selecione um status válido."] },
    };
  }

  const existing = await prisma.demand.findUnique({
    where: { id: parsed.data.id },
    select: { id: true },
  });
  if (!existing) return { ok: false, message: "Demanda não encontrada." };

  await prisma.demand.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status as DemandStatus },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/${parsed.data.id}`);
  return { ok: true };
}

/**
 * Save or clear the internal notes on a demand.
 */
export async function updateInternalNotes(
  _prev: unknown,
  formData: FormData,
): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const parsed = internalNotesSchema.safeParse({
    id: formData.get("id"),
    internalNotes: formData.get("internalNotes"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Observação inválida.",
      fieldErrors: { internalNotes: ["Limite de 2000 caracteres."] },
    };
  }

  const existing = await prisma.demand.findUnique({
    where: { id: parsed.data.id },
    select: { id: true },
  });
  if (!existing) return { ok: false, message: "Demanda não encontrada." };

  await prisma.demand.update({
    where: { id: parsed.data.id },
    data: { internalNotes: parsed.data.internalNotes || null },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/${parsed.data.id}`);
  return { ok: true };
}
