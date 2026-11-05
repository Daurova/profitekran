import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { playlistRoutes } from './infrastructure/http/playlist.route.js';
import multipart from '@fastify/multipart';
import { authRoutes } from './infrastructure/http/auth.route.js';
import cookie from '@fastify/cookie';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  app.register(cookie);
  
  app.register(cors, {
    origin: ['http://localhost:3000', 
      'https://profitekran.online',
      'https://designation-forbes-webcams-accepting.trycloudflare.com',
      'https://explanation-outputs-pierce-another.trycloudflare.com'],
    credentials: true, // <-- Разрешаем передачу куки
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
  

  app.register(authRoutes); 
  app.register(playlistRoutes);

  // Временный дебаг-роут
  app.get('/debug-routes', async () => {
    return app.printRoutes();
  });
  
  return app;
}