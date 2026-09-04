import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Idempotent seed: creates (or refreshes) the demo admin account using
 * credentials from environment variables. Safe to run multiple times.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Administrador Vestaply";

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment before running the seed.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash },
  });

  console.log(`✔ Admin pronto: ${admin.email} (${admin.name})`);
  console.log("  Use a senha definida em ADMIN_PASSWORD para entrar em /login");
}

main()
  .catch((error) => {
    console.error("✖ Falha no seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });