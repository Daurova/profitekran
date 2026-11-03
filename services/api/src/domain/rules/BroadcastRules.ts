export interface BroadcastRules {
  baseDurationSec: number;  // Сколько играет база
  promoDurationSec: number; // Сколько играет реклама
  promoSlots: number;       // Из скольких роликов состоит рекламный блок
}

// Правила для нашего бьюти-коворкинга (из ТЗ PR-отдела)
export const BEAUTY_COWORKING_RULES: BroadcastRules = {
  baseDurationSec: 30,  // 7 минут 24 секунды
  promoDurationSec: 36,  // 36 секунд рекламы
  promoSlots: 3,         // 3 ролика в рекламном блоке
};

export type PromoTemplate = 'A' | 'B' | 'C' | 'D';

// Описание того, какие типы контента должны идти в слотах 2 и 3 (слот 1 всегда COFFEE_ANCHOR)
export const PROMO_TEMPLATES: Record<PromoTemplate, [string, string]> = {
  A: ['SERVICES', 'COFFEE_OFFER'], // Утро, день
  B: ['COFFEE_OFFER', 'MASTER'],   // День, вечер
  C: ['PRODUCT', 'SERVICES'],      // После обеда, выходные
  D: ['COFFEE_OFFER', 'SERVICES'], // Вечер (декаф)
};

// Какие шаблоны предпочтительны для каждого временного слота
export const DAYPART_TEMPLATES: Record<string, PromoTemplate[]> = {
  '09-11': ['A', 'C'],
  '11-14': ['B', 'C', 'A'],
  '14-17': ['C', 'A', 'B'],
  '17-20': ['B', 'D', 'C'],
  '20-22': ['D', 'C'],
};