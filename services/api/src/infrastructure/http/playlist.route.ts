import { FastifyInstance } from 'fastify';
import { GeneratePlaylistUseCase } from '../../application/use-cases/GeneratePlaylistUseCase.js';
import { PrismaContentRepository } from '../repositories/PrismaContentRepository.js';
import { getVideoUrl, uploadVideo, deleteVideo } from '../s3/S3Service.js';
import { prisma } from '../database/prisma.js';
import jwt from 'jsonwebtoken';
import { Orientation } from '@prisma/client';

const JWT_SECRET = process.env['JWT_SECRET'] || 'super-secret-key-for-dev';

export async function playlistRoutes(app: FastifyInstance) {
  const contentRepository = new PrismaContentRepository();
  const generatePlaylistUseCase = new GeneratePlaylistUseCase(contentRepository);

  // Middleware для проверки JWT
  const authPreHandler = async (request: any, reply: any) => {
    try {
      let token = '';
      const authHeader = request.headers.authorization;
      
      if (authHeader) {
        token = authHeader.split(' ')[1];
      } else if (request.cookies && request.cookies.auth_token) {
        token = request.cookies.auth_token;
      }

      if (!token) throw new Error('Нет токена');
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      request.user = decoded;
    } catch (err) {
      return reply.status(401).send({ error: 'Неавторизован' });
    }
  };

  // 1. Плейлист (Требует tenantId, иначе 400)
    // 1. Плейлист (ОТКРЫТ для ТВ, принимает ?deviceId=...)
  app.get('/playlist', async (request, reply) => {
    try {
      const { deviceId } = request.query as { deviceId?: string };
      
      // Если deviceId нет — сразу отдаем 400
      if (!deviceId) {
        return reply.status(400).send({ error: 'Не передан deviceId. Укажите ?deviceId=...' });
      }

      // Ищем экран (приставку) в базе по deviceId
      const screen = await prisma.screen.findUnique({ 
        where: { deviceId },
        include: { tenant: true } // Сразу подтягиваем данные клиента
      });

      // Если экран не найден или он отключен — 403
      if (!screen || !screen.isActive) {
        return reply.status(403).send({ error: 'Экран не активирован или отключен' });
      }

      // Проверяем, активен ли сам клиент (тенант) — вдруг у него не оплачен тариф
      if (!screen.tenant.isActive) {
        return reply.status(403).send({ error: 'Подписка клиента приостановлена' });
      }

      // Генерируем плейлист для найденного тенанта
      const playlist = await generatePlaylistUseCase.execute(screen.tenantId);
      return { status: 'success', data: playlist };
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
        key, type, durationSec, orientation, maxPerHour, cooldownMin, requiresConsent 
      } = request.body as { 
        key: string, 
        type: string, 
        durationSec: number, 
        orientation?: Orientation,
        maxPerHour?: number, 
        cooldownMin?: number, 
        requiresConsent?: boolean
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
          dayparts: ['09-11', '11-14', '14-17', '17-20', '20-22'],
          tenantId: (request as any).user.tenantId,
        },
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
        where: { 
          id,
          tenantId: userTenantId 
        } 
      });
      
      if (!content) {
        return reply.status(404).send({ error: 'Видео не найдено или не принадлежит вам' });
      }

      await deleteVideo(content.url);
      await prisma.content.delete({ where: { id } });

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
        data: {
          deviceId,
          name,
          tenantId,
        },
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
        where: { tenantId: (request as any).user.tenantId },
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

      // Ищем экран, принадлежащий этому тенанту
      const screen = await prisma.screen.findFirst({
        where: { id, tenantId },
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