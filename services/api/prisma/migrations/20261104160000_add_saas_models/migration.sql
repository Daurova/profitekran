-- 1. Создаем таблицу Tenant
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subscriptionEnd" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- Создаем дефолтного тенанта, чтобы не сломать существующие видео
INSERT INTO "Tenant" ("id", "name", "isActive") VALUES ('default', 'Вдохновение', true) ON CONFLICT DO NOTHING;

-- 2. Создаем Enum для ролей
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SMM', 'DESIGNER');

-- 3. Создаем таблицу User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "otpCode" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "tenantId" TEXT NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. Создаем таблицу Screen (с массивом contentIds)
CREATE TABLE "Screen" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "contentIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tenantId" TEXT NOT NULL,
    CONSTRAINT "Screen_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Screen_deviceId_key" ON "Screen"("deviceId");
ALTER TABLE "Screen" ADD CONSTRAINT "Screen_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. Обновляем таблицу Content (добавляем внешний ключ к Tenant)
-- Сначала убираем старый дефолт, чтобы избежать конфликтов
ALTER TABLE "Content" ALTER COLUMN "tenantId" DROP DEFAULT;
-- Теперь добавляем связь
ALTER TABLE "Content" ADD CONSTRAINT "Content_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;