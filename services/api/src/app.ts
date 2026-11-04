import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { playlistRoutes } from './infrastructure/http/playlist.route.js'; // <-- Добавили импорт
import multipart from '@fastify/multipart'; // <-- Импорт

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true, // Включаем логирование (Big Tech стандарт)
  });

  // Разрешаем запросы с любых адресов (на время разработки)
 app.register(cors, {
  origin: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
});

  // Базовый роут для проверки работоспособности
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
  app.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100 МБ (можно поставить больше, если нужно)
    },
  });  
  app.register(playlistRoutes);
  return app;
}