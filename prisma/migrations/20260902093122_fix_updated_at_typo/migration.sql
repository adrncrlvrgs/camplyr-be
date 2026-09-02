/*
  Warnings:

  - You are about to drop the column `updatedAr` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAr` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAr` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAr` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAr` on the `recruiterprofile` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAr` on the `user` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RecruiterProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `application` DROP COLUMN `updatedAr`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `company` DROP COLUMN `updatedAr`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `job` DROP COLUMN `updatedAr`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `post` DROP COLUMN `updatedAr`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `recruiterprofile` DROP COLUMN `updatedAr`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `updatedAr`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
