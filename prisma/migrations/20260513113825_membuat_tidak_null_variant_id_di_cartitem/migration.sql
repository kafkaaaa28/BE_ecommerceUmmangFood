/*
  Warnings:

  - Made the column `variantId` on table `CartItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `CartItem` DROP FOREIGN KEY `CartItem_variantId_fkey`;

-- DropIndex
DROP INDEX `CartItem_variantId_fkey` ON `CartItem`;

-- AlterTable
ALTER TABLE `CartItem` MODIFY `variantId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
