/*
  Warnings:

  - You are about to drop the column `railwayProjectId` on the `Bot` table. All the data in the column will be lost.
  - You are about to drop the column `railwayServiceId` on the `Bot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bot" DROP COLUMN "railwayProjectId",
DROP COLUMN "railwayServiceId",
ADD COLUMN     "renderServiceId" TEXT;
