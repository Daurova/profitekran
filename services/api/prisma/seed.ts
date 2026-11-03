import 'dotenv/config';
import { PrismaClient, ContentType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { parseFile } from 'music-metadata';
import path from 'node:path';

const connectionString = process.env['DATABASE_URL'];
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const VIDEO_DIR = path.resolve(process.cwd(), '../../apps/tv-pwa/public/videos-light');

// Все видео доступны во все временные слоты (для базы)
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
  console.log('Очищаем старую базу...');
  await prisma.content.deleteMany();

  console.log('Начинаем наполнение базы с реальной длительностью...');

  // 1. Базовые видео (доступны всегда)
  for (const filename of baseVideos) {
    const realDuration = await getDurationInSeconds(filename);
    await prisma.content.create({
      data: {
        type: ContentType.BASE,
        url: `/videos-light/${filename}`,
        durationSec: realDuration,
        hasAudio: false,
        dayparts: ALL_DAYPARTS, // База крутится всегда
      },
    });
  }

  // 2. Реклама (только утро и день)
  const anchorDuration = await getDurationInSeconds('cup-of-coffee.mp4');
  await prisma.content.create({
    data: {
      type: ContentType.COFFEE_ANCHOR,
      url: '/videos-light/cup-of-coffee.mp4',
      durationSec: anchorDuration,
      hasAudio: false,
      dayparts: ALL_DAYPARTS,
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
      dayparts: ['17-20', '20-22'], // Только вечер
    },
  });
  
    // 3. Услуги (SERVICES) - доступны утром, днем и вечером
  const servicesDuration = await getDurationInSeconds('sky.mp4');
  await prisma.content.create({
    data: {
      type: ContentType.SERVICES,
      url: '/videos-light/sky.mp4',
      durationSec: servicesDuration,
      hasAudio: false,
      dayparts: ALL_DAYPARTS,
    },
  });

  // 4. Товары (PRODUCT) - доступны днем и вечером
  const productDuration = await getDurationInSeconds('drone-footage.mp4');
  await prisma.content.create({
    data: {
      type: ContentType.PRODUCT,
      url: '/videos-light/drone-footage.mp4',
      durationSec: productDuration,
      hasAudio: false,
      dayparts: ALL_DAYPARTS, 
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