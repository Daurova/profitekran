import { FastifyInstance } from 'fastify';
import { GeneratePlaylistUseCase } from '../../application/use-cases/GeneratePlaylistUseCase.js';
import { PrismaContentRepository } from '../repositories/PrismaContentRepository.js';
import { getVideoUrl, uploadVideo, deleteVideo } from '../s3/S3Service.js'; // <-- Добавили deleteVideo
import { prisma } from '../database/prisma.js';

export async function playlistRoutes(app: FastifyInstance) {
  const contentRepository = new PrismaContentRepository();
  const generatePlaylistUseCase = new GeneratePlaylistUseCase(contentRepository);

  // 1. Плейлист
  app.get('/playlist', async (request, reply) => {
    try {
      const playlist = await generatePlaylistUseCase.execute();
      return { status: 'success', data: playlist };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // 2. Загрузка файла в S3
     app.post('/upload', async (request, reply) => {
    try {
      console.log('--- НАЧАЛО ЗАГРУЗКИ ---');
      
      const data = await request.file();
      if (!data) return reply.status(400).send({ error: 'Нет файла' });
      
      console.log('1. Файл получен:', data.filename, 'MIME:', data.mimetype);

      const buffer = await data.toBuffer();
      console.log('2. Буфер создан, размер:', buffer.length, 'байт');

      console.log('3. Пытаемся прочитать метаданные...');
      const { parseBuffer } = await import('music-metadata');
      const metadata = await parseBuffer(buffer, data.mimetype);
      
      console.log('4. Метаданные прочитаны. Длительность:', metadata.format.duration);
      
      const durationSec = Math.round(metadata.format.duration || 15);
      console.log('5. Итоговая длительность (округленная):', durationSec);

      const key = await uploadVideo(buffer, data.filename);
      console.log('6. Файл загружен в S3, ключ:', key);
      
      return { status: 'success', key, url: getVideoUrl(key), durationSec };
    } catch (error) {
      console.error('❌ ОШИБКА В /UPLOAD:', error);
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка загрузки' });
    }
  });
    // 3. Добавление записи в базу
  app.post('/add-video', async (request, reply) => {
    try {
      console.log('--- НАЧАЛО /ADD-VIDEO ---');
      
      const { key, type, durationSec, maxPerHour, cooldownMin, requiresConsent } = request.body as { 
        key: string, 
        type: string, 
        durationSec: number,
        maxPerHour?: number,
        cooldownMin?: number,
        requiresConsent?: boolean
      };
      
      console.log('Полученные данные:', { key, type, durationSec, maxPerHour, cooldownMin, requiresConsent });

      if (!key || !type) return reply.status(400).send({ error: 'Нужны key и type' });

      const content = await prisma.content.create({
        data: {
          type: type as any,
          url: key,
          durationSec: durationSec || 15,
          hasAudio: false,
          maxPerHour: maxPerHour ?? null,
          cooldownMin: cooldownMin ?? null,
          requiresConsent: requiresConsent || false,
          dayparts: ['09-11', '11-14', '14-17', '17-20', '20-22'],
        },
      });

      console.log('Запись создана, durationSec в базе:', content.durationSec);

      return { status: 'success', content };
    } catch (error) {
      console.error('❌ ОШИБКА В /ADD-VIDEO:', error);
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка добавления видео' });
    }
  });

  // 4. Получение списка видео (НОВЫЙ РОУТ)
  app.get('/videos', async (request, reply) => {
    try {
      const videos = await prisma.content.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return { status: 'success', data: videos };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка получения списка' });
    }
  });

  // 5. Удаление видео (НОВЫЙ РОУТ)
  app.delete('/videos/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const content = await prisma.content.findUnique({ where: { id } });
      if (!content) return reply.status(404).send({ error: 'Видео не найдено' });

      await deleteVideo(content.url);
      await prisma.content.delete({ where: { id } });

      return { status: 'success' };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка удаления' });
    }
  });
}