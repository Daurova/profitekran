import { FastifyInstance } from 'fastify';
import { GeneratePlaylistUseCase } from '../../application/use-cases/GeneratePlaylistUseCase.js';
import { PrismaContentRepository } from '../repositories/PrismaContentRepository.js'; // <-- Новый импорт
import { getVideoUrl, uploadVideo } from '../s3/S3Service.js';

export async function playlistRoutes(app: FastifyInstance) {
  // 1. Инициализируем зависимости (теперь это реальная база!)
  const contentRepository = new PrismaContentRepository();
  const generatePlaylistUseCase = new GeneratePlaylistUseCase(contentRepository);

  // 2. Создаем GET-роут
  app.get('/playlist', async (request, reply) => {
    try {
      const playlist = await generatePlaylistUseCase.execute();
      
      return { 
        status: 'success', 
        data: playlist 
      };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
    // Роут для загрузки видео (пока без авторизации, для теста)
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
}