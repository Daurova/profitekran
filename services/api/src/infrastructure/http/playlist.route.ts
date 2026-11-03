import { FastifyInstance } from 'fastify';
import { GeneratePlaylistUseCase } from '../../application/use-cases/GeneratePlaylistUseCase.js';
import { PrismaContentRepository } from '../repositories/PrismaContentRepository.js'; // <-- Новый импорт

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
}