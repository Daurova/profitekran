import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { playlistRoutes } from './infrastructure/http/playlist.route.js';
import multipart from '@fastify/multipart';
import { authRoutes } from './infrastructure/http/auth.route.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: ['http://localhost:3000', 'https://profitekran.online'],
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
  
  app.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024,
    },
  });  
  

  // ВОТ ЗДЕСЬ ИСПРАВЛЕНИЕ: убираем { prefix: '/auth' }
  app.register(authRoutes); 
  
  app.register(playlistRoutes);

  // Временный дебаг-роут для просмотра всех зарегистрированных путей
  app.get('/debug-routes', async () => {
    return app.printRoutes();
  });
  
  return app;
}