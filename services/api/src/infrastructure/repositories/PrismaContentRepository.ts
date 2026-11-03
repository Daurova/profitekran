import { prisma } from '../database/prisma.js';
import { IContentRepository } from '../../domain/ports/IContentRepository.js';
import { ContentItem, ContentType } from '../../domain/entities/ContentItem.js';

export class PrismaContentRepository implements IContentRepository {
  async getActiveContent(): Promise<ContentItem[]> {
    // Достаем все видео из базы данных PostgreSQL
    const dbContent = await prisma.content.findMany();

    // Преобразуем данные из формата БД в формат нашего Domain-слоя
    return dbContent.map((item) => ({
      id: item.id,
      type: item.type as ContentType,
      url: item.url,
      durationSec: item.durationSec,
      hasAudio: item.hasAudio,
      maxPerHour: item.maxPerHour ?? undefined,
      cooldownMin: item.cooldownMin ?? undefined,
      requiresConsent: item.requiresConsent,
      dayparts: item.dayparts,

    }));
  }
}