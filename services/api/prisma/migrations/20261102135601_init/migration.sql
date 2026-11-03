-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('BASE', 'PROMO', 'COFFEE_ANCHOR', 'COFFEE_OFFER', 'SERVICES', 'MASTER', 'PRODUCT', 'PARTNER');

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "url" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "hasAudio" BOOLEAN NOT NULL DEFAULT false,
    "maxPerHour" INTEGER,
    "cooldownMin" INTEGER,
    "requiresConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);
