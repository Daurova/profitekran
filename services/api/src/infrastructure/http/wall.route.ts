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

      // Если экран есть и принадлежит другому клиенту — ошибка
      if (screen && screen.tenantId !== tenantId) {
        return reply.status(403).send({ error: 'Этот экран уже привязан к другому клиенту' });
      }

      // Если экран есть и уже в стене — ошибка
      if (screen && screen.wallId) {
        return reply.status(400).send({ error: 'Этот экран уже используется в другой медиастене' });
      }

      // Если экрана нет в базе или он свободен — разрешаем (создадим при сборке)
      return { status: 'success', message: 'Экран свободен' };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка проверки экрана' });
    }
  });

  // 2. Создание Медиастены
  app.post('/walls', { preHandler: authPreHandler }, async (request, reply) => {
    try {
      const tenantId = (request as any).user.tenantId;
      const { layout, screens, baseContent, infoContent, promoContent } = request.body as any;

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
                tenantId, // привязываем к текущему тенанту
              },
            });
          } else {
            // Если экрана нет в базе (телевизор новый), создаем его!
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

        // Сохраняем Базовые видео
        for (const v of baseContent.videos) {
          await tx.videoWallItem.create({
            data: {
              wallId: newWall.id,
              tenantId,
              type: 'BASE',
              url: v.url || 'temp-url',
              durationSec: v.durationSec || 15,
              orientation: v.orientation,
              dayparts: v.dayparts,
              qrUrl: infoContent?.qrUrl,
              infoText: infoContent?.text,
            },
          });
        }

        // Сохраняем Рекламные видео
        for (const v of promoContent) {
          await tx.videoWallItem.create({
            data: {
              wallId: newWall.id,
              tenantId,
              type: v.type,
              url: v.url || 'temp-url',
              durationSec: v.durationSec || 15,
              orientation: v.orientation,
              dayparts: v.dayparts,
              qrUrl: v.qrUrl,
              infoText: v.infoText,
            },
          });
        }

        return newWall;
      });

      return { status: 'success', wall };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка создания стены' });
    }
  });
}