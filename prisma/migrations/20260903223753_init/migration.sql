-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "demands" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "protocol" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "deliveryDate" DATETIME NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sizeGrade" TEXT NOT NULL,
    "targetUnitPriceCents" INTEGER,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "internalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "demands_protocol_key" ON "demands"("protocol");

-- CreateIndex
CREATE INDEX "demands_status_idx" ON "demands"("status");

-- CreateIndex
CREATE INDEX "demands_deliveryDate_idx" ON "demands"("deliveryDate");

-- CreateIndex
CREATE INDEX "demands_createdAt_idx" ON "demands"("createdAt");
