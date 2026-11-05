import { FastifyInstance } from 'fastify';
import { AuthService } from '../../application/services/AuthService.js';

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
        secure: process.env['NODE_ENV'] === 'production', // Только по HTTPS в продакшене
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 дней
      });

      return { status: 'success', message: 'Вход выполнен' };
    } catch (error) {
      app.log.error(error);
      return reply.status(401).send({ error: error instanceof Error ? error.message : 'Ошибка входа' });
    }
  });
}