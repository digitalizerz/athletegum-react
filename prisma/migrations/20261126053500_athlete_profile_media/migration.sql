-- AlterTable
ALTER TABLE "User" ADD COLUMN "profilePhoto" TEXT;
ALTER TABLE "User" ADD COLUMN "profileToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_profileToken_key" ON "User"("profileToken");
