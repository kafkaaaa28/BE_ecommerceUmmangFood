/*
  Warnings:

  - A unique constraint covering the columns `[normalizedEmail]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `normalizedEmail` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `emailVerified` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `User_email_key` ON `User`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `normalizedEmail` VARCHAR(191) NOT NULL,
    MODIFY `emailVerified` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `User_normalizedEmail_key` ON `User`(`normalizedEmail`);
