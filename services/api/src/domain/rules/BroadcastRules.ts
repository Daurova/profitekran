export interface BroadcastRules {
  baseDurationSec: number;  // Сколько играет база
  promoDurationSec: number; // Сколько играет реклама
  promoSlots: number;       // Из скольких роликов состоит рекламный блок
}

// Универсальные правила (работают для любого тенанта)
export const DEFAULT_BROADCAST_RULES: BroadcastRules = {
  baseDurationSec: 30,   // В ТЗ было 444 сек, но в коде стоит 30 (проверь, как надо)
  promoDurationSec: 36,  // 36 секунд рекламы
  promoSlots: 3,         // 3 ролика в рекламном блоке
};

export type PromoTemplate = 'A' | 'B' | 'C' | 'D';

// Описание того, какие типы контента должны идти в слотах
// Слот 1 всегда COFFEE_ANCHOR (или любой другой "якорь" в будущем)
export const PROMO_TEMPLATES: Record<PromoTemplate, [string, string]> = {
  A: ['SERVICES', 'PROMO'], // Заменили COFFEE_OFFER на PROMO
  B: ['PROMO', 'SERVICES'], // Заменили COFFEE_OFFER и MASTER на PROMO и SERVICES
  C: ['PRODUCT', 'SERVICES'],
  D: ['PROMO', 'SERVICES'],
};

// Какие шаблоны предпочтительны для каждого временного слота
export const DAYPART_TEMPLATES: Record<string, PromoTemplate[]> = {
  '09-11': ['A', 'C'],
  '11-14': ['B', 'C', 'A'],
  '14-17': ['C', 'A', 'B'],
  '17-20': ['B', 'D', 'C'],
  '20-22': ['D', 'C'],
};