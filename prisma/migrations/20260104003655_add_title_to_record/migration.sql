/*
  Warnings:

  - Added the required column `title` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Record" ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Record_chatId_idx" ON "Record"("chatId");
