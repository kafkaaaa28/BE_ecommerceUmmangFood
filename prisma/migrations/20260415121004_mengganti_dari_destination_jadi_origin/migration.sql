/*
  Warnings:

  - You are about to drop the column `destinationId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `destinationLabel` on the `Address` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Address_destinationId_idx` ON `Address`;

-- AlterTable
ALTER TABLE `Address` DROP COLUMN `destinationId`,
    DROP COLUMN `destinationLabel`,
    ADD COLUMN `origin` INTEGER NULL,
    ADD COLUMN `originLabel` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Address_origin_idx` ON `Address`(`origin`);
