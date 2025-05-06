/*
  Warnings:

  - You are about to drop the column `actualDelivery` on the `PurchasedOrder` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryPersonId` on the `PurchasedOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PurchasedOrder" DROP COLUMN "actualDelivery",
DROP COLUMN "deliveryPersonId",
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPhone" TEXT;
