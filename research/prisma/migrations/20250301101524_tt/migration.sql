/*
  Warnings:

  - Added the required column `name` to the `ProviderProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN     "name" TEXT NOT NULL;
