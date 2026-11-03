import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { playlistRoutes } from './infrastructure/http/playlist.route.js'; // <-- Добавили импорт

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true, // Включаем логирование (Big Tech стандарт)
  });

  // Разрешаем запросы с любых адресов (на время разработки)
  app.register(cors, {
    origin: true,
  });

  // Базовый роут для проверки работоспособности
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  app.register(playlistRoutes);
  return app;
}