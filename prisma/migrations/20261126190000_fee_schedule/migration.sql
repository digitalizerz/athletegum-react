-- CreateTable
CREATE TABLE "FeeSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "freePercent" REAL NOT NULL,
    "proPercent" REAL NOT NULL,
    "growthPercent" REAL NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "FeeSchedule" ("id", "freePercent", "proPercent", "growthPercent", "updatedAt")
VALUES ('default', 10, 8, 6, CURRENT_TIMESTAMP);
