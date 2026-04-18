-- CreateTable Province
CREATE TABLE `Province` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rajaOngkirId` INTEGER NULL,
    `binderbytesId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Province_name_key`(`name`),
    UNIQUE INDEX `Province_rajaOngkirId_key`(`rajaOngkirId`),
    UNIQUE INDEX `Province_binderbytesId_key`(`binderbytesId`),
    INDEX `Province_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable City
CREATE TABLE `City` (
    `id` VARCHAR(191) NOT NULL,
    `provinceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rajaOngkirId` INTEGER NULL,
    `binderbytesId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `City_provinceId_name_key`(`provinceId`, `name`),
    INDEX `City_provinceId_idx`(`provinceId`),
    INDEX `City_name_idx`(`name`),
    PRIMARY KEY (`id`),
    CONSTRAINT `City_provinceId_fkey` FOREIGN KEY (`provinceId`) REFERENCES `Province` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable District
CREATE TABLE `District` (
    `id` VARCHAR(191) NOT NULL,
    `cityId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rajaOngkirId` INTEGER NULL,
    `binderbytesId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `District_cityId_name_key`(`cityId`, `name`),
    INDEX `District_cityId_idx`(`cityId`),
    INDEX `District_name_idx`(`name`),
    PRIMARY KEY (`id`),
    CONSTRAINT `District_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Subdistrict
CREATE TABLE `Subdistrict` (
    `id` VARCHAR(191) NOT NULL,
    `districtId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `postalCode` VARCHAR(191) NULL,
    `rajaOngkirId` INTEGER NULL,
    `binderbytesId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subdistrict_districtId_name_key`(`districtId`, `name`),
    INDEX `Subdistrict_districtId_idx`(`districtId`),
    INDEX `Subdistrict_name_idx`(`name`),
    PRIMARY KEY (`id`),
    CONSTRAINT `Subdistrict_districtId_fkey` FOREIGN KEY (`districtId`) REFERENCES `District` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
