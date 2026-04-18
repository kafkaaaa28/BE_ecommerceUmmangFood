-- DropIndex
DROP INDEX `Address_phone_key` ON `Address`;

-- AlterTable
ALTER TABLE `Address` ADD COLUMN `cityId` INTEGER NULL,
    ADD COLUMN `destinationType` VARCHAR(191) NULL,
    ADD COLUMN `detail` VARCHAR(191) NULL,
    ADD COLUMN `districtId` INTEGER NULL,
    ADD COLUMN `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `provinceId` INTEGER NULL,
    ADD COLUMN `subdistrictId` INTEGER NULL,
    MODIFY `kodePos` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Address_provinceId_idx` ON `Address`(`provinceId`);

-- CreateIndex
CREATE INDEX `Address_cityId_idx` ON `Address`(`cityId`);

-- CreateIndex
CREATE INDEX `Address_districtId_idx` ON `Address`(`districtId`);

-- CreateIndex
CREATE INDEX `Address_subdistrictId_idx` ON `Address`(`subdistrictId`);
