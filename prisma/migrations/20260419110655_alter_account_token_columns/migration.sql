/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `providerAccountId` on the `Account` table. All the data in the column will be lost.
  - Added the required column `provider_account_id` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Account` DROP PRIMARY KEY,
    DROP COLUMN `providerAccountId`,
    ADD COLUMN `provider_account_id` VARCHAR(191) NOT NULL,
    MODIFY `refresh_token` LONGTEXT NULL,
    MODIFY `access_token` LONGTEXT NULL,
    MODIFY `id_token` LONGTEXT NULL,
    ADD PRIMARY KEY (`provider`, `provider_account_id`);
