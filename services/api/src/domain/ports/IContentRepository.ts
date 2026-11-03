import { ContentItem } from '../entities/ContentItem.js';

export interface IContentRepository {
  // Метод, который вернет список доступного контента
  getActiveContent(): Promise<ContentItem[]>;
}