// Типы контента, которые мы обсудили (BASE, PROMO, COFFEE_ANCHOR и т.д.)
export type ContentType = 
  | 'BASE' 
  | 'PROMO' 
  | 'COFFEE_ANCHOR' 
  | 'COFFEE_OFFER' 
  | 'SERVICES' 
  | 'MASTER' 
  | 'PRODUCT' 
  | 'PARTNER';

// Интерфейс самого контента
export interface ContentItem {
  id: string;
  type: ContentType;
  url: string; // Ссылка на видеофайл (пока локальная, потом будет S3)
  durationSec: number;
  hasAudio: boolean;
  dayparts: string[]; 

  maxPerHour?: number | undefined; // <-- Добавили | undefined
  cooldownMin?: number | undefined; // <-- Добавили | undefined
  requiresConsent?: boolean | undefined; // <-- Добавили | undefined
}