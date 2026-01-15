/*
  Warnings:

  - The primary key for the `checkpoints_writes` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "checkpoints_writes" DROP CONSTRAINT "checkpoints_writes_pkey",
ALTER COLUMN "idx" SET DATA TYPE TEXT,
ADD CONSTRAINT "checkpoints_writes_pkey" PRIMARY KEY ("thread_id", "checkpoint_ns", "checkpoint_id", "task_id", "idx");
