import { prisma } from '../database/prisma.js';
import { IContentRepository } from '../../domain/ports/IContentRepository.js';
import { ContentItem, ContentType } from '../../domain/entities/ContentItem.js';

export class PrismaContentRepository implements IContentRepository {
  async getActiveContent(tenantId: string): Promise<ContentItem[]> { // <-- Добавили tenantId
    // Достаем видео ТОЛЬКО для конкретного тенанта
    const dbContent = await prisma.content.findMany({
      where: { tenantId }, // <-- ФИЛЬТР
    });

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