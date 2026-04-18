-- DropForeignKey
ALTER TABLE `City` DROP FOREIGN KEY `City_id_provinsi_fkey`;

-- DropForeignKey
ALTER TABLE `District` DROP FOREIGN KEY `District_id_kabupaten_fkey`;

-- DropForeignKey
ALTER TABLE `Subdistrict` DROP FOREIGN KEY `Subdistrict_id_kecamatan_fkey`;

-- DropIndex
DROP INDEX `City_id_provinsi_key` ON `City`;

-- DropIndex
DROP INDEX `District_id_kabupaten_key` ON `District`;

-- DropIndex
DROP INDEX `Subdistrict_id_kecamatan_key` ON `Subdistrict`;

-- AlterTable
ALTER TABLE `City` MODIFY `id_kabupaten` VARCHAR(191) NOT NULL,
    MODIFY `id_provinsi` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `District` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `id_kecamatan` VARCHAR(191) NOT NULL,
    MODIFY `id_kabupaten` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Province` MODIFY `id_provinsi` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Subdistrict` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `id_kelurahan` VARCHAR(191) NOT NULL,
    MODIFY `id_kecamatan` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `City` ADD CONSTRAINT `City_id_provinsi_fkey` FOREIGN KEY (`id_provinsi`) REFERENCES `Province`(`id_provinsi`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `District` ADD CONSTRAINT `District_id_kabupaten_fkey` FOREIGN KEY (`id_kabupaten`) REFERENCES `City`(`id_kabupaten`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subdistrict` ADD CONSTRAINT `Subdistrict_id_kecamatan_fkey` FOREIGN KEY (`id_kecamatan`) REFERENCES `District`(`id_kecamatan`) ON DELETE CASCADE ON UPDATE CASCADE;
