import 'dotenv/config';
import { PrismaClient, ContentType, Orientation } from '@prisma/client'; // <-- Импортируем Orientation
import { PrismaPg } from '@prisma/adapter-pg';
import { parseFile } from 'music-metadata';
import path from 'node:path';

const connectionString = process.env['DATABASE_URL'];
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const VIDEO_DIR = path.resolve(process.cwd(), '../../apps/tv-pwa/public/videos-light');
const ALL_DAYPARTS = ['09-11', '11-14', '14-17', '17-20', '20-22'];

const baseVideos = [ /* ... список без изменений ... */ ];

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

  // 1. Базовые видео
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
        orientation: Orientation.HORIZONTAL, // <-- Используем Enum (Type-safe)
      },
    });
  }

  // 2. Реклама
  const anchorDuration = await getDurationInSeconds('cup-of-coffee.mp4');
  await prisma.content.create({
    data: {
      type: ContentType.COFFEE_ANCHOR,
      url: '/videos-light/cup-of-coffee.mp4',
      durationSec: anchorDuration,
      hasAudio: false,
      dayparts: ALL_DAYPARTS,
      tenantId: defaultTenant.id,
      orientation: Orientation.HORIZONTAL,
    },
  });

  const offerDuration = await getDurationInSeconds('ai-generated.mp4');
  await prisma.content.create({
    data: {
      type: ContentType.COFFEE_OFFER,
      url: '/videos-light/ai-generated.mp4',
      durationSec: offerDuration,
      hasAudio: false,
      maxPerHour: 2,
      cooldownMin: 30,
      dayparts: ALL_DAYPARTS, 
      tenantId: defaultTenant.id,
      orientation: Orientation.HORIZONTAL,
    },
  });

  const masterDuration = await getDurationInSeconds('sea.mp4');
  await prisma.content.create({
    data: {
      type: ContentType.MASTER,
      url: '/videos-light/sea.mp4',
      durationSec: masterDuration,
      hasAudio: false,
      maxPerHour: 1,
      cooldownMin: 120,
      requiresConsent: true,
      dayparts: ['17-20', '20-22'],
      tenantId: defaultTenant.id,
      orientation: Orientation.HORIZONTAL,
    },
  });
  
  // 3. Услуги
  const servicesDuration = await getDurationInSeconds('sky.mp4');
  await prisma.content.create({
    data: {
      type: ContentType.SERVICES,
      url: '/videos-light/sky.mp4',
      durationSec: servicesDuration,
      hasAudio: false,
      dayparts: ALL_DAYPARTS,
      tenantId: defaultTenant.id,
      orientation: Orientation.HORIZONTAL,
    },
  });

  // 4. Товары
  const productDuration = await getDurationInSeconds('drone-footage.mp4');
  await prisma.content.create({
    data: {
      type: ContentType.PRODUCT,
      url: '/videos-light/drone-footage.mp4',
      durationSec: productDuration,
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