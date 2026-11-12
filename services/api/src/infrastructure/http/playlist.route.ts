import { FastifyInstance } from 'fastify';
import { GeneratePlaylistUseCase } from '../../application/use-cases/GeneratePlaylistUseCase.js';
import { PrismaContentRepository } from '../repositories/PrismaContentRepository.js';
import { getVideoUrl, uploadVideo, deleteVideo } from '../s3/S3Service.js';
import { prisma } from '../database/prisma.js';
import jwt from 'jsonwebtoken';
import { Orientation } from '@prisma/client';
import { authPreHandler } from './middlewares/authPreHandler.js';

const JWT_SECRET = process.env['JWT_SECRET'] || 'super-secret-key-for-dev';

export async function playlistRoutes(app: FastifyInstance) {
  const contentRepository = new PrismaContentRepository();
  const generatePlaylistUseCase = new GeneratePlaylistUseCase(contentRepository);

  // 1. Плейлист (ОТКРЫТ для ТВ, принимает ?deviceId=...)
  app.get('/playlist', async (request, reply) => {
    try {
      const { deviceId } = request.query as { deviceId?: string };
      
      if (!deviceId) {
        return reply.status(400).send({ error: 'Не передан deviceId. Укажите ?deviceId=...' });
      }

      const screen = await prisma.screen.findUnique({ 
        where: { deviceId },
        include: { tenant: true, wall: true }
      });

      if (!screen || !screen.isActive) {
        return reply.status(403).send({ error: 'Экран не активирован или отключен' });
      }

      if (!screen.tenant.isActive) {
        return reply.status(403).send({ error: 'Подписка клиента приостановлена' });
      }

      // 1. Если экран в стене — отдаем контент стены
      if (screen.wallId) {
        const wallItems = await prisma.videoWallItem.findMany({
          where: { wallId: screen.wallId },
          orderBy: { createdAt: 'asc' }
        });

        // Генерируем расписание на сегодняшний день
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        
        const schedule: any[] = [];
        const dayparts = ['09-11', '11-14', '14-17', '17-20', '20-22'];

        for (const daypart of dayparts) {
          const [startHour, endHour] = daypart.split('-').map(Number);
          // Используем || 0, чтобы TS не ругался на undefined
          const daypartStartMs = startOfDay + (startHour || 0) * 60 * 60 * 1000;
          const daypartEndMs = startOfDay + (endHour || 0) * 60 * 60 * 1000;
          
          const activeItems = wallItems.filter(item => item.dayparts.includes(daypart));
          if (activeItems.length === 0) continue;

          let currentMs = daypartStartMs;
          let itemIndex = 0;

          while (currentMs < daypartEndMs) {
            // Восклицательный знак говорит TS, что item точно есть
            const item = activeItems[itemIndex % activeItems.length]!;
            const durationMs = item.durationSec * 1000;

            schedule.push({
              startTime: currentMs,
              endTime: Math.min(currentMs + durationMs, daypartEndMs),
              url: getVideoUrl(item.url),
              qrUrl: item.qrUrl,
              infoText: item.infoText,
              type: item.type,
            });

            currentMs += durationMs;
            itemIndex++;
          }
        }

        if (screen.wallRole === 'INFO') {
          return {
            status: 'success',
            isWall: true,
            wallRole: 'INFO',
            schedule: schedule.map(s => ({
              qrUrl: s.qrUrl,
              infoText: s.infoText,
              startTime: s.startTime,
              endTime: s.endTime,
            })),
          };
        }

        return { 
          status: 'success', 
          isWall: true,
          wallRole: screen.wallRole,
          wallLayout: screen.wall?.layoutType,
          schedule: schedule,
        };
      }

      // 2. Если одиночный экран — генерируем обычный плейлист
      const playlist = await generatePlaylistUseCase.execute(screen.tenantId);
      return { status: 'success', isWall: false, data: playlist };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // 2. Загрузка файла в S3 (ЗАЩИЩЕНО)
  app.post('/upload', { preHandler: authPreHandler }, async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) return reply.status(400).send({ error: 'Нет файла' });

      const buffer = await data.toBuffer();
      const { parseBuffer } = await import('music-metadata');
      const metadata = await parseBuffer(buffer, data.mimetype);
      const durationSec = Math.round(metadata.format.duration || 15);

      const key = await uploadVideo(buffer, data.filename);
      return { status: 'success', key, url: getVideoUrl(key), durationSec };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка загрузки' });
    }
  });

  // 3. Добавление записи в базу (ЗАЩИЩЕНО)
  app.post('/add-video', { preHandler: authPreHandler }, async (request, reply) => {
    try {
      const { 
        key, type, durationSec, orientation, maxPerHour, cooldownMin, requiresConsent, dayparts 
      } = request.body as { 
        key: string; 
        type: string; 
        durationSec: number; 
        orientation?: Orientation;
        maxPerHour?: number; 
        cooldownMin?: number; 
        requiresConsent?: boolean;
        dayparts?: string[];
      };
      
      if (!key || !type) return reply.status(400).send({ error: 'Нужны key и type' });

      const content = await prisma.content.create({
        data: {
          type: type as any,
          url: key,
          durationSec: durationSec || 15,
          hasAudio: false,
          orientation: orientation || 'HORIZONTAL',
          maxPerHour: maxPerHour ?? null,
          cooldownMin: cooldownMin ?? null,
          requiresConsent: requiresConsent || false,
          dayparts: dayparts && dayparts.length > 0 
            ? dayparts 
            : ['09-11', '11-14', '14-17', '17-20', '20-22'],
          tenantId: (request as any).user.tenantId,
        },
      });

        await prisma.tenant.update({
        where: { id: (request as any).user.tenantId },
        data: { playlistVersion: { increment: 1 } },
      });
      return { status: 'success', content };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка добавления видео' });
    }
  });

  // 4. Получение списка видео (ЗАЩИЩЕНО и ФИЛЬТР ПО ТЕНАНТУ)
  app.get('/videos', { preHandler: authPreHandler }, async (request, reply) => {
    try {
      const videos = await prisma.content.findMany({
        where: { tenantId: (request as any).user.tenantId },
        orderBy: { createdAt: 'desc' },
      });
      return { status: 'success', data: videos };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка получения списка' });
    }
  });

  // 5. Удаление видео (ЗАЩИЩЕНО и ПРОВЕРЕНО ПО ТЕНАНТУ)
  app.delete('/videos/:id', { preHandler: authPreHandler }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userTenantId = (request as any).user.tenantId;
      
      const content = await prisma.content.findFirst({ 
        where: { id, tenantId: userTenantId } 
      });
      
      if (!content) {
        return reply.status(404).send({ error: 'Видео не найдено или не принадлежит вам' });
      }

      await deleteVideo(content.url);
      await prisma.content.delete({ where: { id } });
            // Обновляем версию плейлиста
      await prisma.tenant.update({
        where: { id: userTenantId },
        data: { playlistVersion: { increment: 1 } },
      });
      
      return { status: 'success' };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка удаления' });
    }
  });

  // 6. Добавление экрана (привязка приставки к клиенту)
  app.post('/screens', { preHandler: authPreHandler }, async (request, reply) => {
    try {
      const { deviceId, name } = request.body as { deviceId: string, name: string };
      const tenantId = (request as any).user.tenantId;

      if (!deviceId || !name) return reply.status(400).send({ error: 'Нужны deviceId и name' });

      const screen = await prisma.screen.create({
        data: { deviceId, name, tenantId },
      });

      return { status: 'success', screen };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка добавления экрана' });
    }
  });

  // 7. Получение списка экранов (ЗАЩИЩЕНО)
  app.get('/screens', { preHandler: authPreHandler }, async (request, reply) => {
    try {
      const screens = await prisma.screen.findMany({
        where: { tenantId: (request as any).user.tenantId, wallId: null },
        orderBy: { name: 'asc' },
      });
      return { status: 'success', data: screens };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка получения списка экранов' });
    }
  });

  // 8. Удаление экрана (ЗАЩИЩЕНО)
  app.delete('/screens/:id', { preHandler: authPreHandler }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const tenantId = (request as any).user.tenantId;

      const screen = await prisma.screen.findFirst({
        where: { id, tenantId, wallId: null },
      });

      if (!screen) {
        return reply.status(404).send({ error: 'Экран не найден или не принадлежит вам' });
      }

      await prisma.screen.delete({ where: { id } });

      return { status: 'success', message: 'Экран удален' };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка удаления экрана' });
    }
  });
}