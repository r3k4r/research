-- CreateEnum
CREATE TYPE "FoodItemStatus" AS ENUM ('ACTIVE', 'SOLD', 'EXPIRED');

-- AlterTable
ALTER TABLE "FoodItem" ADD COLUMN     "status" "FoodItemStatus" NOT NULL DEFAULT 'ACTIVE';
