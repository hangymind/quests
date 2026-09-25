ALTER TABLE `User`
ADD COLUMN `isSuperAdmin` BOOLEAN NOT NULL DEFAULT false;

UPDATE `User`
SET `isSuperAdmin` = true
WHERE `id` IN (
  SELECT `userId`
  FROM `UserRole`
  INNER JOIN `Role` ON `Role`.`id` = `UserRole`.`roleId`
  WHERE `Role`.`name` = '超级管理员'
);

UPDATE `User`
SET `isSuperAdmin` = true
ORDER BY `createdAt` ASC
LIMIT 1;
