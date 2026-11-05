import jwt from 'jsonwebtoken';
import { prisma } from '../../infrastructure/database/prisma.js';
import { sendSmsCode } from '../../infrastructure/sms/SmsService.js';

const JWT_SECRET = process.env['JWT_SECRET'] || 'super-secret-key-for-dev';

export class AuthService {
  // 1. Отправить код на телефон
  async sendCode(phone: string): Promise<void> {
    // Генерируем 4-значный код
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    // Ищем пользователя по номеру
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      // Если пользователя нет, создаем нового (привязываем к дефолтному тенанту пока)
      user = await prisma.user.create({
        data: {
          phone,
          otpCode: code,
          otpExpiresAt: expiresAt,
          tenantId: 'default', // Пока все новые юзеры в дефолтном тенанте
        },
      });
    } else {
      // Если есть, обновляем код
      await prisma.user.update({
        where: { id: user.id },
        data: { otpCode: code, otpExpiresAt: expiresAt },
      });
    }

    // Отправляем СМС (пока в консоль)
    await sendSmsCode(phone, code);
  }

  // 2. Проверить код и выдать токен
  async verifyCode(phone: string, code: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) throw new Error('Пользователь не найден');
    if (user.otpCode !== code) throw new Error('Неверный код');
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new Error('Код истек');
    }

    // Код верный. Очищаем его и генерируем JWT
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiresAt: null },
    });

    // Создаем токен (живет 7 дней)
    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return token;
  }
}