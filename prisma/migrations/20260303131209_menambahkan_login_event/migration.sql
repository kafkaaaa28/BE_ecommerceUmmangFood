-- CreateTable
CREATE TABLE `LoginEvent` (
    `id` VARCHAR(255) NOT NULL,
    `userId` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `provider` ENUM('GOOGLE', 'EMAIL') NOT NULL,
    `success` BOOLEAN NOT NULL DEFAULT true,
    `reason` VARCHAR(255) NOT NULL,
    `ipAddress` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
