CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `username` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `User_username_key`(`username`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Role` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  UNIQUE INDEX `Role_name_key`(`name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Permission` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NOT NULL,
  UNIQUE INDEX `Permission_key_key`(`key`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `UserRole` (
  `userId` VARCHAR(191) NOT NULL,
  `roleId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`userId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `RolePermission` (
  `roleId` VARCHAR(191) NOT NULL,
  `permissionId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`roleId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Survey` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'STOPPED') NOT NULL DEFAULT 'DRAFT',
  `allowAnonymous` BOOLEAN NOT NULL DEFAULT true,
  `requireLogin` BOOLEAN NOT NULL DEFAULT false,
  `restrictDevice` BOOLEAN NOT NULL DEFAULT false,
  `restrictIp` BOOLEAN NOT NULL DEFAULT false,
  `maxSubmissions` INTEGER NOT NULL DEFAULT 1,
  `showProgress` BOOLEAN NOT NULL DEFAULT true,
  `showQuestionNumber` BOOLEAN NOT NULL DEFAULT true,
  `startsAt` DATETIME(3) NULL,
  `endsAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `ownerId` VARCHAR(191) NOT NULL,
  UNIQUE INDEX `Survey_slug_key`(`slug`),
  INDEX `Survey_ownerId_updatedAt_idx`(`ownerId`, `updatedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SurveyQuestion` (
  `id` VARCHAR(191) NOT NULL,
  `surveyId` VARCHAR(191) NOT NULL,
  `order` INTEGER NOT NULL,
  `type` ENUM('TEXT', 'TEXTAREA', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SELECT', 'RATING', 'DATE', 'NUMBER') NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `required` BOOLEAN NOT NULL DEFAULT false,
  `config` JSON NOT NULL,
  INDEX `SurveyQuestion_surveyId_order_idx`(`surveyId`, `order`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SurveyLogicRule` (
  `id` VARCHAR(191) NOT NULL,
  `surveyId` VARCHAR(191) NOT NULL,
  `sourceQuestionId` VARCHAR(191) NOT NULL,
  `targetQuestionId` VARCHAR(191) NOT NULL,
  `operator` VARCHAR(191) NOT NULL,
  `value` JSON NOT NULL,
  `action` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SurveyResponse` (
  `id` VARCHAR(191) NOT NULL,
  `surveyId` VARCHAR(191) NOT NULL,
  `respondentId` VARCHAR(191) NULL,
  `ipHash` VARCHAR(191) NULL,
  `deviceHash` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'COMPLETED',
  `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completedAt` DATETIME(3) NULL,
  INDEX `SurveyResponse_surveyId_completedAt_idx`(`surveyId`, `completedAt`),
  INDEX `SurveyResponse_surveyId_status_ipHash_idx`(`surveyId`, `status`, `ipHash`),
  INDEX `SurveyResponse_surveyId_status_deviceHash_idx`(`surveyId`, `status`, `deviceHash`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SurveyAnswer` (
  `id` VARCHAR(191) NOT NULL,
  `responseId` VARCHAR(191) NOT NULL,
  `questionId` VARCHAR(191) NOT NULL,
  `value` JSON NOT NULL,
  UNIQUE INDEX `SurveyAnswer_responseId_questionId_key`(`responseId`, `questionId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SurveyEvent` (
  `id` VARCHAR(191) NOT NULL,
  `surveyId` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `SurveyEvent_surveyId_createdAt_idx`(`surveyId`, `createdAt`),
  INDEX `SurveyEvent_surveyId_type_idx`(`surveyId`, `type`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Survey` ADD CONSTRAINT `Survey_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `SurveyQuestion` ADD CONSTRAINT `SurveyQuestion_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `Survey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SurveyLogicRule` ADD CONSTRAINT `SurveyLogicRule_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `Survey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SurveyLogicRule` ADD CONSTRAINT `SurveyLogicRule_targetQuestionId_fkey` FOREIGN KEY (`targetQuestionId`) REFERENCES `SurveyQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SurveyResponse` ADD CONSTRAINT `SurveyResponse_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `Survey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SurveyResponse` ADD CONSTRAINT `SurveyResponse_respondentId_fkey` FOREIGN KEY (`respondentId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `SurveyAnswer` ADD CONSTRAINT `SurveyAnswer_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `SurveyResponse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SurveyAnswer` ADD CONSTRAINT `SurveyAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `SurveyQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SurveyEvent` ADD CONSTRAINT `SurveyEvent_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `Survey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
