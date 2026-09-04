import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demands = await prisma.demand.findMany({
    select: { id: true, protocol: true, status: true },
    orderBy: { deliveryDate: "asc" },
  });
  for (const d of demands) {
    console.log(`${d.protocol} | ${d.id} | ${d.status}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());