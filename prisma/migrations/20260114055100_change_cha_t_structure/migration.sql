/*
  Warnings:

  - You are about to drop the column `userId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `chatId` on the `Record` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Record" DROP CONSTRAINT "Record_chatId_fkey";

-- DropIndex
DROP INDEX "Record_chatId_idx";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Record" DROP COLUMN "chatId";

-- CreateTable
CREATE TABLE "RecordChat" (
    "recordId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "RecordChat_pkey" PRIMARY KEY ("recordId","chatId")
);

-- CreateIndex
CREATE INDEX "RecordChat_chatId_idx" ON "RecordChat"("chatId");

-- AddForeignKey
ALTER TABLE "RecordChat" ADD CONSTRAINT "RecordChat_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordChat" ADD CONSTRAINT "RecordChat_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
