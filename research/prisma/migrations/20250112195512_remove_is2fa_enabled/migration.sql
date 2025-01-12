/*
  Warnings:

  - You are about to drop the column `isTwoFactorEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ResetPasswordToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TwoFactorToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `twoFactorConfirmation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "twoFactorConfirmation" DROP CONSTRAINT "twoFactorConfirmation_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isTwoFactorEnabled",
ADD COLUMN     "emailVerificationTokenExpires" TIMESTAMP(3);

-- DropTable
DROP TABLE "ResetPasswordToken";

-- DropTable
DROP TABLE "TwoFactorToken";

-- DropTable
DROP TABLE "twoFactorConfirmation";
