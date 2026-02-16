/*
  Warnings:

  - You are about to drop the column `renderServiceId` on the `Bot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bot" DROP COLUMN "renderServiceId",
ADD COLUMN     "railwayProjectId" TEXT,
ADD COLUMN     "railwayServiceId" TEXT;
