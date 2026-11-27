-- AlterTable
ALTER TABLE "DirectoryListing" ADD COLUMN "email" TEXT;
ALTER TABLE "DirectoryListing" ADD COLUMN "claimTokenHash" TEXT;
ALTER TABLE "DirectoryListing" ADD COLUMN "claimExpiresAt" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryListing_email_key" ON "DirectoryListing"("email");
CREATE UNIQUE INDEX "DirectoryListing_claimTokenHash_key" ON "DirectoryListing"("claimTokenHash");
