import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  const delivery = new Date();
  delivery.setDate(today.getDate() + 30);

  const d = await prisma.demand.upsert({
    where: { protocol: "VST-2026-DEMO01" },
    update: {},
    create: {
      protocol: "VST-2026-DEMO01",
      buyerName: "Marina Souza",
      email: "marina@marca-exemplo.com.br",
      companyName: "Marca Exemplo Confecções",
      category: "Moda feminina",
      deliveryDate: delivery,
      quantity: 120,
      sizeGrade: "P 20 · M 60 · G 40",
      targetUnitPriceCents: 2890,
      notes: "Cotação para coleção primavera/verão 2026. Tecido algodão premium.",
      status: "pendente",
    },
  });
  console.log(`Created: ${d.protocol} — ${d.companyName}`);

  // Second one with closer delivery date
  const delivery2 = new Date();
  delivery2.setDate(today.getDate() + 12);

  const d2 = await prisma.demand.upsert({
    where: { protocol: "VST-2026-DEMO02" },
    update: {},
    create: {
      protocol: "VST-2026-DEMO02",
      buyerName: "Carlos Pereira",
      email: "carlos@lojacarlos.com.br",
      companyName: "Loja Carlos Multimarcas",
      category: "Moda masculina",
      deliveryDate: delivery2,
      quantity: 60,
      sizeGrade: "P 10 · M 20 · G 20 · GG 10",
      targetUnitPriceCents: 4500,
      notes: null,
      status: "pendente",
    },
  });
  console.log(`Created: ${d2.protocol} — ${d2.companyName}`);

  // Third one further out, no price
  const delivery3 = new Date();
  delivery3.setDate(today.getDate() + 60);

  const d3 = await prisma.demand.upsert({
    where: { protocol: "VST-2026-DEMO03" },
    update: {},
    create: {
      protocol: "VST-2026-DEMO03",
      buyerName: "Juliana Mendes",
      email: "juliana@revendaonline.com.br",
      companyName: "Revenda Online BH",
      category: "Acessórios",
      deliveryDate: delivery3,
      quantity: 200,
      sizeGrade: "Tamanho único",
      targetUnitPriceCents: null,
      notes: "Primeira compra, sem referência de preço.",
      status: "pendente",
    },
  });
  console.log(`Created: ${d3.protocol} — ${d3.companyName}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());