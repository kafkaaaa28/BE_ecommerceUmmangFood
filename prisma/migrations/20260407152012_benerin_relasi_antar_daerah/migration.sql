/*
  Warnings:

  - You are about to drop the column `postalCode` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `provinceId` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `cityId` on the `District` table. All the data in the column will be lost.
  - You are about to drop the column `rajaOngkirId` on the `District` table. All the data in the column will be lost.
  - You are about to drop the column `districtId` on the `Subdistrict` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Subdistrict` table. All the data in the column will be lost.
  - You are about to drop the column `rajaOngkirId` on the `Subdistrict` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_provinsi]` on the table `City` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_provinsi,name]` on the table `City` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_kabupaten]` on the table `District` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_kabupaten,name]` on the table `District` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_kecamatan]` on the table `Subdistrict` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_kecamatan,name]` on the table `Subdistrict` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_provinsi` to the `City` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_kabupaten` to the `District` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_kecamatan` to the `Subdistrict` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `City` DROP FOREIGN KEY `City_provinceId_fkey`;

-- DropForeignKey
ALTER TABLE `District` DROP FOREIGN KEY `District_cityId_fkey`;

-- DropForeignKey
ALTER TABLE `Subdistrict` DROP FOREIGN KEY `Subdistrict_districtId_fkey`;

-- DropIndex
DROP INDEX `City_provinceId_idx` ON `City`;

-- DropIndex
DROP INDEX `City_provinceId_name_key` ON `City`;

-- DropIndex
DROP INDEX `District_cityId_idx` ON `District`;

-- DropIndex
DROP INDEX `District_cityId_name_key` ON `District`;

-- DropIndex
DROP INDEX `Subdistrict_districtId_idx` ON `Subdistrict`;

-- DropIndex
DROP INDEX `Subdistrict_districtId_name_key` ON `Subdistrict`;

-- AlterTable
ALTER TABLE `City` DROP COLUMN `postalCode`,
    DROP COLUMN `provinceId`,
    ADD COLUMN `id_provinsi` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `District` DROP COLUMN `cityId`,
    DROP COLUMN `rajaOngkirId`,
    ADD COLUMN `id_kabupaten` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Subdistrict` DROP COLUMN `districtId`,
    DROP COLUMN `postalCode`,
    DROP COLUMN `rajaOngkirId`,
    ADD COLUMN `id_kecamatan` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `City_id_provinsi_key` ON `City`(`id_provinsi`);

-- CreateIndex
CREATE INDEX `City_id_provinsi_idx` ON `City`(`id_provinsi`);

-- CreateIndex
CREATE UNIQUE INDEX `City_id_provinsi_name_key` ON `City`(`id_provinsi`, `name`);

-- CreateIndex
CREATE UNIQUE INDEX `District_id_kabupaten_key` ON `District`(`id_kabupaten`);

-- CreateIndex
CREATE INDEX `District_id_kabupaten_idx` ON `District`(`id_kabupaten`);

-- CreateIndex
CREATE UNIQUE INDEX `District_id_kabupaten_name_key` ON `District`(`id_kabupaten`, `name`);

-- CreateIndex
CREATE UNIQUE INDEX `Subdistrict_id_kecamatan_key` ON `Subdistrict`(`id_kecamatan`);

-- CreateIndex
CREATE INDEX `Subdistrict_id_kecamatan_idx` ON `Subdistrict`(`id_kecamatan`);

-- CreateIndex
CREATE UNIQUE INDEX `Subdistrict_id_kecamatan_name_key` ON `Subdistrict`(`id_kecamatan`, `name`);

-- AddForeignKey
ALTER TABLE `City` ADD CONSTRAINT `City_id_provinsi_fkey` FOREIGN KEY (`id_provinsi`) REFERENCES `Province`(`id_provinsi`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `District` ADD CONSTRAINT `District_id_kabupaten_fkey` FOREIGN KEY (`id_kabupaten`) REFERENCES `City`(`id_kabupaten`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subdistrict` ADD CONSTRAINT `Subdistrict_id_kecamatan_fkey` FOREIGN KEY (`id_kecamatan`) REFERENCES `District`(`id_kecamatan`) ON DELETE CASCADE ON UPDATE CASCADE;
