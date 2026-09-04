// Test the validation pipeline of submit-demand. We import the schema
// and verify the same rules the Server Action applies.

import { demandFormSchema } from "../src/lib/validators";
import { parseBrlToCents } from "../src/lib/format";

function show(label: string, input: unknown) {
  const result = demandFormSchema.safeParse(input);
  console.log(`\n[${label}]`);
  console.log("  ok:", result.success);
  if (!result.success) {
    for (const issue of result.error.issues) {
      console.log(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
  } else {
    console.log("  parsed quantity:", result.data.quantity);
    console.log("  parsed delivery:", result.data.deliveryDate.toISOString().slice(0, 10));
  }
}

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

show("Válido", validInput);

show("Email inválido", { ...validInput, email: "not-an-email" });
show("Data no passado", { ...validInput, deliveryDate: past.toISOString().slice(0, 10) });
show("Quantidade 0", { ...validInput, quantity: "0" });
show("Quantidade negativa", { ...validInput, quantity: "-5" });
show("Quantidade não-inteira", { ...validInput, quantity: "1.5" });
show("Categoria inválida", { ...validInput, category: "Outra" });
show("Sem preço-alvo (opcional)", { ...validInput, targetUnitPrice: "" });
show("Preço negativo", { ...validInput, targetUnitPrice: "-5,00" });
show("Comprador sem nome", { ...validInput, buyerName: "" });
show("Notas longas demais", { ...validInput, notes: "x".repeat(2001) });

console.log("\n=== parseBrlToCents tests ===");
const cases = ["12,50", "12.50", "1.234,56", "1234.56", "0,01", "0", "abc", "", "  5,00  ", "1,5", "0,001"];
for (const c of cases) {
  console.log(`  ${JSON.stringify(c).padEnd(14)} → ${parseBrlToCents(c)} cents`);
}