/*
  Warnings:

  - You are about to drop the column `amenities` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `amenitiesVocabulary` on the `SiteSettings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dealType" TEXT NOT NULL,
    "usageType" TEXT NOT NULL,
    "propertySubtype" TEXT,
    "areaName" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Chennai',
    "priceInr" INTEGER NOT NULL,
    "sizeSqft" INTEGER NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "parking" TEXT,
    "topFacilities" TEXT,
    "locationAdvantages" TEXT,
    "tourEmbedUrl" TEXT NOT NULL,
    "images" TEXT,
    "advanceMonths" INTEGER,
    "leasePeriodYears" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Property" ("advanceMonths", "areaName", "bathrooms", "bedrooms", "city", "createdAt", "dealType", "id", "images", "isFeatured", "isPublished", "leasePeriodYears", "parking", "priceInr", "propertySubtype", "sizeSqft", "slug", "title", "tourEmbedUrl", "updatedAt", "usageType") SELECT "advanceMonths", "areaName", "bathrooms", "bedrooms", "city", "createdAt", "dealType", "id", "images", "isFeatured", "isPublished", "leasePeriodYears", "parking", "priceInr", "propertySubtype", "sizeSqft", "slug", "title", "tourEmbedUrl", "updatedAt", "usageType" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");
CREATE INDEX "Property_dealType_idx" ON "Property"("dealType");
CREATE INDEX "Property_usageType_idx" ON "Property"("usageType");
CREATE INDEX "Property_areaName_idx" ON "Property"("areaName");
CREATE INDEX "Property_isPublished_idx" ON "Property"("isPublished");
CREATE INDEX "Property_isFeatured_idx" ON "Property"("isFeatured");
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandName" TEXT NOT NULL DEFAULT 'Tolet Board Chennai',
    "tagline" TEXT NOT NULL DEFAULT '360° Tours • Rent & Lease • Chennai',
    "city" TEXT NOT NULL DEFAULT 'Chennai',
    "whatsappNumber" TEXT NOT NULL DEFAULT '+919876543210',
    "phoneNumber" TEXT NOT NULL DEFAULT '+919876543210',
    "whatsappTemplate" TEXT NOT NULL DEFAULT 'Hi, I''m interested in {propertyTitle}. Link: {propertyUrl}',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("brandName", "city", "id", "phoneNumber", "tagline", "updatedAt", "whatsappNumber", "whatsappTemplate") SELECT "brandName", "city", "id", "phoneNumber", "tagline", "updatedAt", "whatsappNumber", "whatsappTemplate" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
