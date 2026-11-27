-- CreateTable
CREATE TABLE "DirectoryListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "position" TEXT,
    "teamOrSchool" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "status" TEXT NOT NULL DEFAULT 'listed',
    "claimedUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DirectoryListing_claimedUserId_fkey" FOREIGN KEY ("claimedUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntroRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "listingId" TEXT,
    "athleteId" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntroRequest_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntroRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "DirectoryListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntroRequest_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryListing_claimedUserId_key" ON "DirectoryListing"("claimedUserId");

-- CreateIndex
CREATE INDEX "DirectoryListing_level_sport_idx" ON "DirectoryListing"("level", "sport");

-- CreateIndex
CREATE INDEX "DirectoryListing_city_idx" ON "DirectoryListing"("city");

-- CreateIndex
CREATE INDEX "IntroRequest_businessId_idx" ON "IntroRequest"("businessId");

-- CreateIndex
CREATE INDEX "IntroRequest_listingId_idx" ON "IntroRequest"("listingId");

-- CreateIndex
CREATE INDEX "IntroRequest_athleteId_idx" ON "IntroRequest"("athleteId");
