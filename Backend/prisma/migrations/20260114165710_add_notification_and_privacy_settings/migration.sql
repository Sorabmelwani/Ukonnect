-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "nationality" TEXT,
    "city" TEXT,
    "visaType" TEXT,
    "purpose" TEXT,
    "visaShareCode" TEXT,
    "visaExpiryDate" DATETIME,
    "consentTerms" BOOLEAN NOT NULL DEFAULT false,
    "consentAI" BOOLEAN NOT NULL DEFAULT false,
    "notificationEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificationPush" BOOLEAN NOT NULL DEFAULT true,
    "profileVisible" BOOLEAN NOT NULL DEFAULT true,
    "showNationality" BOOLEAN NOT NULL DEFAULT true,
    "showLocation" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("city", "consentAI", "consentTerms", "fullName", "id", "nationality", "purpose", "userId", "visaExpiryDate", "visaShareCode", "visaType") SELECT "city", "consentAI", "consentTerms", "fullName", "id", "nationality", "purpose", "userId", "visaExpiryDate", "visaShareCode", "visaType" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
