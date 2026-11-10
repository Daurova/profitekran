import { FastifyInstance } from 'fastify';
import { prisma } from '../database/prisma.js';
import { authPreHandler } from './middlewares/authPreHandler.js';
import { WallLayout, WallRole } from '@prisma/client';

export async function wallRoutes(app: FastifyInstance) {
  // 1. Создание Медиастены
  app.post('/walls', { preHandler: authPreHandler }, async (request, reply) => {
    try {
      const tenantId = (request as any).user.tenantId;
      const { layoutType, screens, baseContent, infoContent, promoContent } = request.body as any;

      if (!layoutType || !screens) {
        return reply.status(400).send({ error: 'Нужны layoutType и screens' });
      }

      // Мапим строку схемы из UI в Enum
      const layoutMap: Record<string, WallLayout> = {
        '2_h': WallLayout.TWO_HORIZONTAL,
        '2_v': WallLayout.TWO_VERTICAL,
        '3_h': WallLayout.THREE_HORIZONTAL,
        '3_v': WallLayout.THREE_VERTICAL,
      };

      const layout = layoutMap[layoutType];
      if (!layout) return reply.status(400).send({ error: 'Неверная схема' });

      // Проверяем, что все экраны существуют и принадлежат тенанту
      const screenCodes = Object.values(screens); // ['A1B2C3', 'D4E5F6'...]
      const dbScreens = await prisma.screen.findMany({
        where: { deviceId: { in: screenCodes as string[] }, tenantId },
      });

      if (dbScreens.length !== screenCodes.length) {
        return reply.status(404).send({ error: 'Некоторые экраны не найдены или не принадлежат вам' });
      }

      // Создаем стену в транзакции (чтобы если что-то упадет, ничего не сохранилось)
      const wall = await prisma.$transaction(async (tx) => {
        // 1. Создаем саму стену
        const newWall = await tx.videoWall.create({
          data: {
            name: `Стена ${layoutType}`, // Можно потом добавить поле name в UI
            layoutType: layout,
            tenantId,
          },
        });

        // 2. Привязываем экраны и назначаем роли
        for (const [role, code] of Object.entries(screens)) {
          await tx.screen.update({
            where: { deviceId: code as string },
            data: {
              wallId: newWall.id,
              wallRole: role as WallRole,
            },
          });
        }

        // 3. Сохраняем Базовые видео (у них общий QR и текст)
        for (const v of baseContent.videos) {
          await tx.videoWallItem.create({
            data: {
              wallId: newWall.id,
              tenantId,
              type: 'BASE',
              url: v.url || 'temp-url', // В реальности url придет после загрузки в S3
              durationSec: v.durationSec || 15,
              orientation: v.orientation,
              dayparts: v.dayparts,
              qrUrl: infoContent?.qrUrl, // Общий QR для базовых
              infoText: infoContent?.text,
            },
          });
        }

        // 4. Сохраняем Рекламные видео (у них индивидуальный QR)
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