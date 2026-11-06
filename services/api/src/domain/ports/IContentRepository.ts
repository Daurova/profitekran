import { ContentItem } from '../entities/ContentItem.js';

export interface IContentRepository {
  // Метод, который вернет список доступного контента
  getActiveContent(tenantId: string): Promise<ContentItem[]>; // <-- Обновили сигнатуру
}