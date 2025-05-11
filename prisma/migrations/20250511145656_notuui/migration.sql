-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('DELIVERY', 'ITEM', 'PREPARING', 'OTHERS');

-- AlterTable
ALTER TABLE "PurchasedOrder" ADD COLUMN     "isReviewed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "orderId" TEXT,
ADD COLUMN     "type" "ReviewType" NOT NULL DEFAULT 'ITEM';

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PurchasedOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
