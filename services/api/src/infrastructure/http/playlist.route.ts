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
      const data = await request.file();
      if (!data) return reply.status(400).send({ error: 'Нет файла' });

      const buffer = await data.toBuffer();
      const key = await uploadVideo(buffer, data.filename);
      
      return { status: 'success', key, url: getVideoUrl(key) };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка загрузки' });
    }
  });

  // 3. Добавление записи в базу
  app.post('/add-video', async (request, reply) => {
    try {
      const { key, type } = request.body as { key: string, type: string };
      if (!key || !type) return reply.status(400).send({ error: 'Нужны key и type' });

      const content = await prisma.content.create({
        data: {
          type: type as any,
          url: key,
          durationSec: 15,
          hasAudio: false,
          dayparts: ['09-11', '11-14', '14-17', '17-20', '20-22'],
        },
      });

      return { status: 'success', content };
    } catch (error) {
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