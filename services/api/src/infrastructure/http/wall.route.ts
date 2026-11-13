import { FastifyInstance } from 'fastify';
import { prisma } from '../database/prisma.js';
import { authPreHandler } from './middlewares/authPreHandler.js';
import { WallLayout, WallRole } from '@prisma/client';

export async function wallRoutes(app: FastifyInstance) {
  // 1. Проверка кода экрана при вводе
  app.post('/walls/verify-screen', { preHandler: authPreHandler }, async (request, reply) => {
    try {
      const tenantId = (request as any).user.tenantId;
      const { deviceId } = request.body as { deviceId: string };

      if (!deviceId) return reply.status(400).send({ error: 'Нужен deviceId' });

      const screen = await prisma.screen.findUnique({ where: { deviceId } });

      if (screen && screen.tenantId !== tenantId) {
        return reply.status(403).send({ error: 'Этот экран уже привязан к другому клиенту' });
      }

      if (screen && screen.wallId) {
        return reply.status(400).send({ error: 'Этот экран уже используется в другой медиастене' });
      }

      return { status: 'success', message: 'Экран свободен' };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка проверки экрана' });
    }
  });

  // 2. Создание каркаса Медиастены (без контента)
  app.post('/walls', { preHandler: authPreHandler }, async (request, reply) => {
    try {
      const tenantId = (request as any).user.tenantId;
      const { layout, screens } = request.body as any;

      if (!layout || !screens) {
        return reply.status(400).send({ error: 'Нужны layoutType и screens' });
      }

      const layoutMap: Record<string, WallLayout> = {
        '2_h': WallLayout.TWO_HORIZONTAL,
        '2_v': WallLayout.TWO_VERTICAL,
        '3_h': WallLayout.THREE_HORIZONTAL,
        '3_v': WallLayout.THREE_VERTICAL,
      };

      const layoutEnum = layoutMap[layout];
      if (!layoutEnum) return reply.status(400).send({ error: 'Неверная схема' });

      const screenCodes = Object.values(screens) as string[];
      const existingScreens = await prisma.screen.findMany({
        where: { deviceId: { in: screenCodes } },
      });

      const wall = await prisma.$transaction(async (tx) => {
        const newWall = await tx.videoWall.create({
          data: {
            name: `Стена ${layout}`,
            layoutType: layoutEnum,
            tenantId,
          },
        });

        // Привязываем или создаем экраны
        for (const [role, code] of Object.entries(screens)) {
          const existing = existingScreens.find(s => s.deviceId === code);
          
          if (existing) {
            await tx.screen.update({
              where: { id: existing.id },
              data: {
                wallId: newWall.id,
                wallRole: role as WallRole,
                tenantId,
              },
            });
          } else {
            await tx.screen.create({
              data: {
                deviceId: code as string,
                name: `Экран ${role}`,
                tenantId,
                wallId: newWall.id,
                wallRole: role as WallRole,
              },
            });
          }
        }

        return newWall;
      });

      return { status: 'success', wall };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка создания стены' });
    }
  });

  // 2.1. Добавление контента в стену
  app.post('/walls/:id/content', { preHandler: authPreHandler }, async (request, reply) => {
    try {
      const tenantId = (request as any).user.tenantId;
      const { id } = request.params as { id: string };
      const { baseContent, infoContent, promoContent } = request.body as any;

      const wall = await prisma.videoWall.findFirst({ where: { id, tenantId } });
      if (!wall) return reply.status(404).send({ error: 'Стена не найдена' });

      // Удаляем старый контент (если редактируем)
      await prisma.videoWallItem.deleteMany({ where: { wallId: id } });

      // Добавляем базовые видео
      for (const v of baseContent.videos) {
        await prisma.videoWallItem.create({
          data: {
            wallId: id,
            tenantId,
            type: 'BASE',
            url: v.url,
            durationSec: v.durationSec || 15,
            orientation: v.orientation,
            dayparts: v.dayparts,
            qrUrl: infoContent?.qrUrl,
            infoText: infoContent?.text,
          },
        });
      }

      // Добавляем рекламу
      for (const v of promoContent) {
        await prisma.videoWallItem.create({
          data: {
            wallId: id,
            tenantId,
            type: v.type,
            url: v.url,
            durationSec: v.durationSec || 15,
            orientation: v.orientation,
            dayparts: v.dayparts,
            qrUrl: v.qrUrl,
            infoText: v.infoText,
          },
        });
      }

      // ДОБАВИЛИ: Обновляем версию плейлиста для тенанта
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { playlistVersion: { increment: 1 } },
      });

      return { status: 'success' };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка сохранения контента' });
    }
  });

  // 3. Получение списка стен
  app.get('/walls', { preHandler: authPreHandler }, async (request, reply) => {
    try {
      const walls = await prisma.videoWall.findMany({
        where: { tenantId: (request as any).user.tenantId },
        include: { 
          screens: true,
          items: true 
        },
        orderBy: { createdAt: 'desc' },
      });
      return { status: 'success', data: walls };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка получения списка стен' });
    }
  });

    // 4. Получение контента стены
  app.get('/walls/:id/content', { preHandler: authPreHandler }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const tenantId = (request as any).user.tenantId;

      const items = await prisma.videoWallItem.findMany({
        where: { wallId: id, tenantId },
        orderBy: { createdAt: 'asc' },
      });

      return { status: 'success', data: items };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка получения контента стены' });
    }
  });
}

