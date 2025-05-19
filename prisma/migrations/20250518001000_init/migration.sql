-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigoRUUFE" TEXT NOT NULL,
    "barcode" TEXT,
    "producto" TEXT NOT NULL,
    "precioCOP" REAL NOT NULL,
    "usdCost" REAL NOT NULL,
    "rrp" REAL NOT NULL,
    "pesoGR" REAL NOT NULL,
    "marca" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PickingOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PickingItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "picked" INTEGER NOT NULL DEFAULT 0,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "PickingItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PickingOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PickingItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_codigoRUUFE_key" ON "Product"("codigoRUUFE");

-- CreateIndex
CREATE INDEX "Product_codigoRUUFE_idx" ON "Product"("codigoRUUFE");

-- CreateIndex
CREATE INDEX "Product_barcode_idx" ON "Product"("barcode");

-- CreateIndex
CREATE INDEX "Product_marca_idx" ON "Product"("marca");

-- CreateIndex
CREATE UNIQUE INDEX "PickingOrder_invoiceNumber_key" ON "PickingOrder"("invoiceNumber");

-- CreateIndex
CREATE INDEX "PickingOrder_status_idx" ON "PickingOrder"("status");

-- CreateIndex
CREATE INDEX "PickingItem_orderId_idx" ON "PickingItem"("orderId");

-- CreateIndex
CREATE INDEX "PickingItem_productId_idx" ON "PickingItem"("productId");
