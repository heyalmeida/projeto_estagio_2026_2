import { prisma } from "@/lib/prisma";
import type { DemandStatus } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export interface DemandListFilters {
  search?: string;
  status?: DemandStatus | "todos";
  category?: string | "todas";
}

/**
 * List demands for the admin panel. Sorted by:
 *   1. desired delivery date ascending (closer first)
 *   2. creation date descending as tie-breaker
 *
 * No pagination — returns all matching records.
 * Filters: search (company/buyer/protocol), status, category.
 */
export async function listDemands(filters: DemandListFilters = {}) {
  const where: Prisma.DemandWhereInput = {};

  if (filters.status && filters.status !== "todos") {
    where.status = filters.status;
  }

  if (filters.category && filters.category !== "todas") {
    where.category = filters.category;
  }

  const search = filters.search?.trim();
  if (search) {
    where.OR = [
      { companyName: { contains: search } },
      { buyerName: { contains: search } },
      { protocol: { contains: search.toUpperCase() } },
      { email: { contains: search.toLowerCase() } },
    ];
  }

  return prisma.demand.findMany({
    where,
    orderBy: [{ deliveryDate: "asc" }, { createdAt: "desc" }],
  });
}

export interface DashboardSummary {
  total: number;
  pendente: number;
  confirmado: number;
  cancelado: number;
  potentialValueCents: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [total, pendente, confirmado, cancelado, pending] = await Promise.all([
    prisma.demand.count(),
    prisma.demand.count({ where: { status: "pendente" } }),
    prisma.demand.count({ where: { status: "confirmado" } }),
    prisma.demand.count({ where: { status: "cancelado" } }),
    prisma.demand.findMany({
      where: { status: "pendente", targetUnitPriceCents: { not: null } },
      select: { quantity: true, targetUnitPriceCents: true },
    }),
  ]);

  const potentialValueCents = pending.reduce((acc, demand) => {
    if (demand.targetUnitPriceCents == null) return acc;
    return acc + demand.targetUnitPriceCents * demand.quantity;
  }, 0);

  return {
    total,
    pendente,
    confirmado,
    cancelado,
    potentialValueCents,
  };
}

export async function getDemandById(id: string) {
  return prisma.demand.findUnique({ where: { id } });
}