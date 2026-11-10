-- CreateEnum
CREATE TYPE "WallRole" AS ENUM ('INFO', 'VIDEO_FULL', 'VIDEO_TOP', 'VIDEO_BOTTOM', 'VIDEO_LEFT', 'VIDEO_RIGHT');

-- CreateEnum
CREATE TYPE "WallLayout" AS ENUM ('TWO_HORIZONTAL', 'TWO_VERTICAL', 'THREE_HORIZONTAL', 'THREE_VERTICAL');

-- AlterTable
ALTER TABLE "Screen" ADD COLUMN     "wallId" TEXT,
ADD COLUMN     "wallRole" "WallRole";

-- CreateTable
CREATE TABLE "VideoWall" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "layoutType" "WallLayout" NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoWall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoWallItem" (
    "id" TEXT NOT NULL,
    "wallId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "url" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "orientation" "Orientation" NOT NULL DEFAULT 'HORIZONTAL',
    "qrUrl" TEXT,
    "infoText" TEXT,
    "dayparts" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoWallItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Screen" ADD CONSTRAINT "Screen_wallId_fkey" FOREIGN KEY ("wallId") REFERENCES "VideoWall"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoWall" ADD CONSTRAINT "VideoWall_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoWallItem" ADD CONSTRAINT "VideoWallItem_wallId_fkey" FOREIGN KEY ("wallId") REFERENCES "VideoWall"("id") ON DELETE CASCADE ON UPDATE CASCADE;
