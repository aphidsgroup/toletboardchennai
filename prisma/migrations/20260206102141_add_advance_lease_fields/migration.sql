-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Property" (
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
    "amenities" TEXT NOT NULL,
    "tourEmbedUrl" TEXT NOT NULL,
    "advanceMonths" INTEGER,
    "leasePeriodYears" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandName" TEXT NOT NULL DEFAULT 'Tolet Board Chennai',
    "tagline" TEXT NOT NULL DEFAULT '360° Tours • Rent & Lease • Chennai',
    "city" TEXT NOT NULL DEFAULT 'Chennai',
    "whatsappNumber" TEXT NOT NULL DEFAULT '+919876543210',
    "phoneNumber" TEXT NOT NULL DEFAULT '+919876543210',
    "whatsappTemplate" TEXT NOT NULL DEFAULT 'Hi, I''m interested in {propertyTitle}. Link: {propertyUrl}',
    "amenitiesVocabulary" TEXT NOT NULL DEFAULT '["Lift","Parking","Security","Power Backup","Water Supply","Gym","Swimming Pool","Garden","Play Area","Club House"]',
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");

-- CreateIndex
CREATE INDEX "Property_dealType_idx" ON "Property"("dealType");

-- CreateIndex
CREATE INDEX "Property_usageType_idx" ON "Property"("usageType");

-- CreateIndex
CREATE INDEX "Property_areaName_idx" ON "Property"("areaName");

-- CreateIndex
CREATE INDEX "Property_isPublished_idx" ON "Property"("isPublished");

-- CreateIndex
CREATE INDEX "Property_isFeatured_idx" ON "Property"("isFeatured");
