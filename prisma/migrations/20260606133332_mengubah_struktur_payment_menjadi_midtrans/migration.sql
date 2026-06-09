/*
  Warnings:

  - You are about to drop the column `channelCode` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `gatewayReference` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentUrl` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `proofUrl` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `publisherOrderId` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gatewayOrderId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gatewayTransactionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Payment_channelCode_idx` ON `Payment`;

-- DropIndex
DROP INDEX `Payment_gatewayReference_key` ON `Payment`;

-- DropIndex
DROP INDEX `Payment_method_idx` ON `Payment`;

-- DropIndex
DROP INDEX `Payment_status_createdAt_idx` ON `Payment`;

-- AlterTable
ALTER TABLE `Payment` DROP COLUMN `channelCode`,
    DROP COLUMN `gatewayReference`,
    DROP COLUMN `paymentUrl`,
    DROP COLUMN `proofUrl`,
    DROP COLUMN `publisherOrderId`,
    ADD COLUMN `bankCode` VARCHAR(191) NULL,
    ADD COLUMN `checkoutUrl` VARCHAR(191) NULL,
    ADD COLUMN `expiredAt` DATETIME(3) NULL,
    ADD COLUMN `fraudStatus` VARCHAR(191) NULL,
    ADD COLUMN `gatewayOrderId` VARCHAR(191) NULL,
    ADD COLUMN `gatewayResponse` JSON NULL,
    ADD COLUMN `gatewayTransactionId` VARCHAR(191) NULL,
    ADD COLUMN `paymentType` VARCHAR(191) NULL,
    ADD COLUMN `snapToken` VARCHAR(191) NULL,
    ADD COLUMN `transactionStatus` VARCHAR(191) NULL,
    ALTER COLUMN `gateway` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_gatewayOrderId_key` ON `Payment`(`gatewayOrderId`);

-- CreateIndex
CREATE UNIQUE INDEX `Payment_gatewayTransactionId_key` ON `Payment`(`gatewayTransactionId`);
