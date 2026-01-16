/*
  Warnings:

  - A unique constraint covering the columns `[userId,templateId]` on the table `UserTask` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserTask_userId_templateId_key" ON "UserTask"("userId", "templateId");
