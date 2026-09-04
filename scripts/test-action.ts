// Smoke test: simulate the action's database operations directly
// (the auth() guard cannot be tested outside a request context, but
// we can validate that the schema and the update path are correct).

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demand = await prisma.demand.findFirst({
    where: { protocol: "VST-2026-DEMO01" },
  });
  if (!demand) throw new Error("DEMO01 not found");

  console.log("Initial status:", demand.status);

  // Simulate confirm
  await prisma.demand.update({
    where: { id: demand.id },
    data: { status: "confirmado" },
  });
  const confirmed = await prisma.demand.findUnique({ where: { id: demand.id } });
  console.log("After confirm:", confirmed?.status);

  // Simulate internal notes update
  await prisma.demand.update({
    where: { id: demand.id },
    data: { internalNotes: "Lead qualificado. Encaminhar para 3 fornecedores." },
  });
  const withNotes = await prisma.demand.findUnique({ where: { id: demand.id } });
  console.log("Internal notes:", withNotes?.internalNotes);

  // Simulate cancel
  await prisma.demand.update({
    where: { id: demand.id },
    data: { status: "cancelado" },
  });
  const cancelled = await prisma.demand.findUnique({ where: { id: demand.id } });
  console.log("After cancel:", cancelled?.status);

  // Test ordering query used by the panel
  const ordered = await prisma.demand.findMany({
    orderBy: [{ deliveryDate: "asc" }, { createdAt: "desc" }],
    select: { protocol: true, deliveryDate: true },
  });
  console.log("Order check:");
  for (const d of ordered) {
    console.log(`  ${d.protocol} → ${d.deliveryDate.toISOString().slice(0, 10)}`);
  }

  // Reset for clean state
  await prisma.demand.update({
    where: { id: demand.id },
    data: { status: "pendente", internalNotes: null },
  });
  console.log("Reset to pendente (clean state for screenshot)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());