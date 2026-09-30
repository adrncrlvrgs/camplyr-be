-- CreateTable
CREATE TABLE `applicationanswer` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NULL,
    `questionLabel` VARCHAR(191) NOT NULL,
    `questionType` ENUM('SHORT_TEXT', 'LONG_TEXT', 'SINGLE_CHOICE', 'MULTI_CHOICE', 'YES_NO', 'NUMBER', 'DATE') NOT NULL,
    `value` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ApplicationAnswer_applicationId_idx`(`applicationId`),
    INDEX `ApplicationAnswer_questionId_idx`(`questionId`),
    UNIQUE INDEX `ApplicationAnswer_applicationId_questionId_key`(`applicationId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobquestion` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `type` ENUM('SHORT_TEXT', 'LONG_TEXT', 'SINGLE_CHOICE', 'MULTI_CHOICE', 'YES_NO', 'NUMBER', 'DATE') NOT NULL,
    `required` BOOLEAN NOT NULL DEFAULT true,
    `options` JSON NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `JobQuestion_jobId_idx`(`jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `applicationanswer` ADD CONSTRAINT `ApplicationAnswer_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `application`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applicationanswer` ADD CONSTRAINT `ApplicationAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `jobquestion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobquestion` ADD CONSTRAINT `JobQuestion_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
