/*
  Warnings:

  - The values [DUITKU] on the enum `Payment_gateway` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Payment` MODIFY `gateway` ENUM('MIDTRANS') NOT NULL;
