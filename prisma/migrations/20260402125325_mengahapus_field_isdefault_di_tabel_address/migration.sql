/*
  Warnings:

  - You are about to drop the column `isDefault` on the `Address` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Address_isDefault_idx` ON `Address`;

-- AlterTable
ALTER TABLE `Address` DROP COLUMN `isDefault`;
