/*
  Warnings:

  - You are about to drop the column `raiting` on the `ProviderProfile` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryPersonName` on the `PurchasedOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProviderProfile" DROP COLUMN "raiting";

-- AlterTable
ALTER TABLE "PurchasedOrder" DROP COLUMN "deliveryPersonName";
