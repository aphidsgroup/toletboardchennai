-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Admin',
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dealType" TEXT NOT NULL,
    "usageType" TEXT NOT NULL,
    "propertySubtype" TEXT,
    "areaName" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Chennai',
    "priceInr" INTEGER NOT NULL,
    "isNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "sizeSqft" INTEGER NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "parking" TEXT,
    "topFacilities" TEXT,
    "locationAdvantages" TEXT,
    "floorNumber" INTEGER,
    "totalFloors" INTEGER,
    "furnishing" TEXT,
    "tenantPreference" TEXT,
    "carpetAreaSqft" INTEGER,
    "availableFrom" TIMESTAMP(3),
    "propertyAge" TEXT,
    "propertyDetails" TEXT,
    "customSections" TEXT,
    "sectionOrder" TEXT,
    "sectionNames" TEXT,
    "customHighlights" TEXT,
    "customFaqs" TEXT,
    "tourEmbedUrl" TEXT,
    "images" TEXT,
    "advanceMonths" INTEGER,
    "leasePeriodYears" INTEGER,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBachelorFriendly" BOOLEAN NOT NULL DEFAULT false,
    "isPetFriendly" BOOLEAN NOT NULL DEFAULT false,
    "isVegetarianOnly" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isRentedOut" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "brandName" TEXT NOT NULL DEFAULT 'Tolet Board Chennai',
    "tagline" TEXT NOT NULL DEFAULT '360° Tours • Rent & Lease • Chennai',
    "city" TEXT NOT NULL DEFAULT 'Chennai',
    "whatsappNumber" TEXT NOT NULL DEFAULT '+919363393324',
    "phoneNumber" TEXT NOT NULL DEFAULT '+919363393324',
    "whatsappTemplate" TEXT NOT NULL DEFAULT 'Hi, I''m interested in {propertyTitle}. Link: {propertyUrl}',
    "heroTitle" TEXT NOT NULL DEFAULT 'Tolet Board Chennai',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Find Your Perfect Space',
    "heroCta" TEXT NOT NULL DEFAULT 'Browse Properties',
    "categoryHeading" TEXT NOT NULL DEFAULT 'Browse by Category',
    "typeHeading" TEXT NOT NULL DEFAULT 'Browse by Type',
    "recentHeading" TEXT NOT NULL DEFAULT 'Recently Added',
    "footerText" TEXT NOT NULL DEFAULT '© 2026 Tolet Board Chennai. All rights reserved.',
    "listPageTitle" TEXT NOT NULL DEFAULT 'Properties',
    "leadPopupTitle" TEXT NOT NULL DEFAULT 'Looking for a Property?',
    "leadPopupSubtitle" TEXT NOT NULL DEFAULT 'Tell us what you need — we''ll find it for you!',
    "amenitiesVocabulary" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "whatsappNumber" TEXT,
    "wantsWhatsappUpdates" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manager" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permissions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shortlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shortlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadFormResponse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "lookingFor" TEXT NOT NULL,
    "propertyType" TEXT,
    "budgetRange" TEXT,
    "preferredArea" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadFormResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "leadType" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'other',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "whatsappNumber" TEXT,
    "propertyAddress" TEXT,
    "propertyType" TEXT,
    "expectedRent" INTEGER,
    "lookingFor" TEXT,
    "budgetRange" TEXT,
    "preferredArea" TEXT,
    "bhkPreference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assignedTo" TEXT,
    "followUpDate" TIMESTAMP(3),
    "notes" TEXT,
    "closedVia" TEXT,
    "closedPropertyId" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeRequest" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityTitle" TEXT NOT NULL,
    "changes" TEXT,
    "reason" TEXT,
    "requestedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangeRequest_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_email_key" ON "Manager"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Shortlist_userId_propertyId_key" ON "Shortlist"("userId", "propertyId");

-- CreateIndex
CREATE INDEX "Lead_leadType_idx" ON "Lead"("leadType");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");

-- CreateIndex
CREATE INDEX "ChangeRequest_status_idx" ON "ChangeRequest"("status");

-- CreateIndex
CREATE INDEX "ChangeRequest_entityType_idx" ON "ChangeRequest"("entityType");

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
