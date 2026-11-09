import 'dotenv/config';
import { PrismaClient, ContentType, Orientation } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { parseFile } from 'music-metadata';
import path from 'node:path';

const connectionString = process.env['DATABASE_URL'];
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const VIDEO_DIR = path.resolve(process.cwd(), '../../apps/tv-pwa/public/videos-light');
const ALL_DAYPARTS = ['09-11', '11-14', '14-17', '17-20', '20-22'];

const baseVideos = [
  'a-cup-of-foamy-cappuccino-and-black-coffee-on-a-surface.mp4',
  'ai-generated.mp4',
  'atmospheric.mp4',
  'caf.mp4',
  'coffee.mp4',
  'cozy-cafe-scene-with-cappuccino-and-latte-art.mp4',
  'cup-of-coffee.mp4',
  'cup-of-coffee-on-table.mp4',
  'dramatic-golden-sunset-with-fluffy-clouds.mp4',
  'drone-footage.mp4',
  'high-angle-shot-of-coffee-based-beverages.mp4',
  'person-pouring-milk-in-a-cup-of-coffee.mp4',
  'sea.mp4',
  'sky.mp4',
  'sunset.mp4'
];

async function getDurationInSeconds(filename: string): Promise<number> {
  const filePath = path.join(VIDEO_DIR, filename);
  const metadata = await parseFile(filePath);
  return Math.round(metadata.format.duration || 15);
}

async function main() {
  console.log('Очищаем базу (каскадно)...');
  // Удаляем всё, что связано с тенантами, чтобы не было ошибок FK
  await prisma.user.deleteMany();
  await prisma.screen.deleteMany();
  await prisma.content.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('Создаем дефолтного клиента...');
  const defaultTenant = await prisma.tenant.create({
    data: {
      name: 'Вдохновение (Тест)',
      isActive: true,
    }
  });

  console.log('Начинаем наполнение базы...');

  // 1. Базовые видео (BASE)
  for (const filename of baseVideos) {
    const realDuration = await getDurationInSeconds(filename);
    await prisma.content.create({
      data: {
        type: ContentType.BASE,
        url: `/videos-light/${filename}`,
        durationSec: realDuration,
        hasAudio: false,
        dayparts: ALL_DAYPARTS,
        tenantId: defaultTenant.id,
        orientation: Orientation.HORIZONTAL,
      },
    });
  }

  // 2. Короткая заставка (ANCHOR)
  const anchorDuration = await getDurationInSeconds('cup-of-coffee.mp4');
  await prisma.content.create({
    data: {
      type: ContentType.ANCHOR,
      url: '/videos-light/cup-of-coffee.mp4',
      durationSec: anchorDuration,
      hasAudio: false,
      dayparts: ALL_DAYPARTS,
      tenantId: defaultTenant.id,
      orientation: Orientation.HORIZONTAL,
    },
  });

  // 3. Спецпредложение (OFFER) - с QR-кодом
  const offerDuration = await getDurationInSeconds('ai-generated.mp4');
  await prisma.content.create({
    data: {
      type: ContentType.OFFER,
      url: '/videos-light/ai-generated.mp4',
      durationSec: offerDuration,
      hasAudio: false,
      maxPerHour: 2,
      cooldownMin: 30,
      dayparts: ALL_DAYPARTS, 
      tenantId: defaultTenant.id,
      orientation: Orientation.HORIZONTAL,
      actionUrl: 'https://example.com/coffee-discount', // QR-код на скидку
    },
  });

  // 4. Услуга/Сотрудник (SERVICE) - с QR-кодом
  const serviceDuration = await getDurationInSeconds('sea.mp4');
  await prisma.content.create({
    data: {
      type: ContentType.SERVICE,
      url: '/videos-light/sea.mp4',
      durationSec: serviceDuration,
      hasAudio: false,
      maxPerHour: 1,
      cooldownMin: 120,
      requiresConsent: true,
      dayparts: ['17-20', '20-22'],
      tenantId: defaultTenant.id,
      orientation: Orientation.HORIZONTAL,
      actionUrl: 'https://example.com/booking-master', // QR-код на запись
    },
  });

  // 5. Универсальная реклама (PROMO) - без QR-кода (атмосфера)
  const promoDuration = await getDurationInSeconds('sky.mp4');
  await prisma.content.create({
    data: {
      type: ContentType.PROMO,
      url: '/videos-light/sky.mp4',
      durationSec: promoDuration,
      hasAudio: false,
      dayparts: ALL_DAYPARTS,
      tenantId: defaultTenant.id,
      orientation: Orientation.HORIZONTAL,
    },
  });

  console.log('База успешно наполнена реальными данными и расписанием!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });