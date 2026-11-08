import jwt from 'jsonwebtoken';
import { prisma } from '../../infrastructure/database/prisma.js';
import { sendSmsCode } from '../../infrastructure/sms/SmsService.js';

const JWT_SECRET = process.env['JWT_SECRET'] || 'super-secret-key-for-dev';

export class AuthService {
  // 1. Отправить код на телефон
    // 1. Отправить код на телефон
  async sendCode(phone: string): Promise<void> {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      // SELF-SERVICE: Если пользователя нет, создаем нового ТЕНАНТА и привязываем юзера к нему
      const newTenant = await prisma.tenant.create({
        data: {
          name: `Клиент ${phone}`, // Временное название, потом можно будет изменить в настройках
          isActive: true,
        },
      });

      user = await prisma.user.create({
        data: {
          phone,
          otpCode: code,
          otpExpiresAt: expiresAt,
          tenantId: newTenant.id, // Привязываем к НОВОМУ тенанту
        },
      });
    } else {
      // Если пользователь уже есть, просто обновляем код
      await prisma.user.update({
        where: { id: user.id },
        data: { otpCode: code, otpExpiresAt: expiresAt },
      });
    }

    await sendSmsCode(phone, code);
  }
  // 2. Проверить код и выдать токен
    // 2. Проверить код и выдать токен
  async verifyCode(phone: string, code: string): Promise<{ token: string, isNewUser: boolean }> {
    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) throw new Error('Пользователь не найден');
    if (user.otpCode !== code) throw new Error('Неверный код');
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new Error('Код истек');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiresAt: null },
    });

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Проверяем, новый ли это клиент (если название начинается с "Клиент ")
    const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
    const isNewUser = tenant?.name.startsWith('Клиент ') ?? false;

    return { token, isNewUser };
  }
}