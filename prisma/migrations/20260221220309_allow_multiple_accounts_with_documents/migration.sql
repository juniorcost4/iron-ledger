/*
  Warnings:

  - You are about to drop the column `document` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[document]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `document` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('COMMON', 'MERCHANT');

-- DropIndex
DROP INDEX "Account_userId_key";

-- DropIndex
DROP INDEX "User_document_key";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "document" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "type" "AccountType" NOT NULL DEFAULT 'COMMON';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "document",
DROP COLUMN "fullName",
DROP COLUMN "type",
DROP COLUMN "updatedAt";

-- DropEnum
DROP TYPE "UserType";

-- CreateIndex
CREATE UNIQUE INDEX "Account_document_key" ON "Account"("document");
