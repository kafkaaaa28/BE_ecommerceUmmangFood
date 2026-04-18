/*
  Warnings:

  - You are about to drop the column `binderbytesId` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `rajaOngkirId` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `binderbytesId` on the `District` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `District` table. All the data in the column will be lost.
  - You are about to drop the column `binderbytesId` on the `Province` table. All the data in the column will be lost.
  - You are about to drop the column `rajaOngkirId` on the `Province` table. All the data in the column will be lost.
  - You are about to drop the column `binderbytesId` on the `Subdistrict` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Subdistrict` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_kabupaten]` on the table `City` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_kecamatan]` on the table `District` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_provinsi]` on the table `Province` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_kelurahan]` on the table `Subdistrict` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_kabupaten` to the `City` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_kecamatan` to the `District` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_provinsi` to the `Province` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_kelurahan` to the `Subdistrict` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Province_binderbytesId_key` ON `Province`;

-- DropIndex
DROP INDEX `Province_rajaOngkirId_key` ON `Province`;

-- AlterTable
ALTER TABLE `City` DROP COLUMN `binderbytesId`,
    DROP COLUMN `rajaOngkirId`,
    ADD COLUMN `id_kabupaten` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `District` DROP COLUMN `binderbytesId`,
    DROP COLUMN `createdAt`,
    ADD COLUMN `id_kecamatan` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Province` DROP COLUMN `binderbytesId`,
    DROP COLUMN `rajaOngkirId`,
    ADD COLUMN `id_provinsi` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Subdistrict` DROP COLUMN `binderbytesId`,
    DROP COLUMN `createdAt`,
    ADD COLUMN `id_kelurahan` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `City_id_kabupaten_key` ON `City`(`id_kabupaten`);

-- CreateIndex
CREATE UNIQUE INDEX `District_id_kecamatan_key` ON `District`(`id_kecamatan`);

-- CreateIndex
CREATE UNIQUE INDEX `Province_id_provinsi_key` ON `Province`(`id_provinsi`);

-- CreateIndex
CREATE UNIQUE INDEX `Subdistrict_id_kelurahan_key` ON `Subdistrict`(`id_kelurahan`);
