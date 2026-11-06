import { FastifyInstance } from 'fastify';
import { AuthService } from '../../application/services/AuthService.js';
import jwt from 'jsonwebtoken'; 
import { prisma } from '../database/prisma.js'

const JWT_SECRET = process.env['JWT_SECRET'] || 'super-secret-key-for-dev';

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService();

  // 1. Отправить код на телефон
  app.post('/auth/send-code', async (request, reply) => {
    try {
      const { phone } = request.body as { phone: string };
      if (!phone) return reply.status(400).send({ error: 'Введите номер телефона' });

      await authService.sendCode(phone);
      return { status: 'success', message: 'Код отправлен' };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Ошибка отправки кода' });
    }
  });

  // 2. Проверить код и установить Cookie
  app.post('/auth/verify-code', async (request, reply) => {
    try {
      const { phone, code } = request.body as { phone: string, code: string };
      if (!phone || !code) return reply.status(400).send({ error: 'Нужны телефон и код' });

      const token = await authService.verifyCode(phone, code);

      // Устанавливаем HttpOnly куку
      reply.setCookie('auth_token', token, {
        path: '/',
        httpOnly: true,
        secure: true, // Только по HTTPS в продакшене
        sameSite: 'none',
        maxAge: 60 * 60 * 24 * 7, // 7 дней
      });

      return { status: 'success', message: 'Вход выполнен' };
    } catch (error) {
      app.log.error(error);
      return reply.status(401).send({ error: error instanceof Error ? error.message : 'Ошибка входа' });
    }
  });
  
   // 3. Проверка авторизации и получение данных тенанта
  app.get('/auth/me', async (request, reply) => {
    try {
      const cookieHeader = request.headers.cookie;
      if (!cookieHeader || !cookieHeader.includes('auth_token=')) {
        return reply.status(401).send({ error: 'Неавторизован' });
      }

      // Достаем токен из куки
      const token = cookieHeader.split('auth_token=')[1]?.split(';')[0];
      if (!token) return reply.status(401).send({ error: 'Токен не найден' });

      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Ищем пользователя и его тенанта в базе
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { tenant: true }
      });

      if (!user || !user.tenant) {
        return reply.status(401).send({ error: 'Пользователь или тенант не найдены' });
      }

      return { 
        status: 'success', 
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          tenantName: user.tenant.name 
        }
      };
    } catch (error) {
      return reply.status(401).send({ error: 'Неавторизован' });
    }
  });
}