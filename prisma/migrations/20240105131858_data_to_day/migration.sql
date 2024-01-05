/*
  Warnings:

  - You are about to drop the column `data` on the `hourcontrol` table. All the data in the column will be lost.
  - Added the required column `day` to the `HourControl` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `hourcontrol` DROP COLUMN `data`,
    ADD COLUMN `day` DATETIME(3) NOT NULL;
