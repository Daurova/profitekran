import jwt from 'jsonwebtoken';
import { prisma } from '../../infrastructure/database/prisma.js';
import { sendSmsCode } from '../../infrastructure/sms/SmsService.js';

const JWT_SECRET = process.env['JWT_SECRET'] || 'super-secret-key-for-dev';

export class AuthService {
  // 1. Отправить код на телефон
  async sendCode(phone: string): Promise<void> {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      // Ищем дефолтного тенанта (первого в базе)
      const defaultTenant = await prisma.tenant.findFirst();
      if (!defaultTenant) throw new Error('В базе нет ни одного клиента (тенанта)');

      await prisma.user.create({
        data: {
          phone,
          otpCode: code,
          otpExpiresAt: expiresAt,
          tenantId: defaultTenant.id,
        },
      });
    } else {
      // Сбрасываем старый код и обновляем новый
      await prisma.user.update({
        where: { id: user.id },
        data: { otpCode: code, otpExpiresAt: expiresAt },
      });
    }

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

    // Big Tech Way: Транзакция (очистка кода и выдача токена)
    const token = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { otpCode: null, otpExpiresAt: null },
      });

      return jwt.sign(
        { userId: user.id, tenantId: user.tenantId, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    });

    return token;
  }
}