import { ContentItem } from '../../domain/entities/ContentItem.js';
import { IContentRepository } from '../../domain/ports/IContentRepository.js';
import { 
  BEAUTY_COWORKING_RULES, 
  BroadcastRules, 
  PROMO_TEMPLATES, 
  DAYPART_TEMPLATES 
} from '../../domain/rules/BroadcastRules.js';

export class GeneratePlaylistUseCase {
  constructor(
    private readonly contentRepository: IContentRepository,
    private readonly rules: BroadcastRules = BEAUTY_COWORKING_RULES
  ) {}

  private getCurrentDaypart(): string {
    const hour = new Date().getHours();
    if (hour >= 9 && hour < 11) return '09-11';
    if (hour >= 11 && hour < 14) return '11-14';
    if (hour >= 14 && hour < 17) return '14-17';
    if (hour >= 17 && hour < 20) return '17-20';
    if (hour >= 20 && hour < 22) return '20-22';
    return '09-11'; 
  }

  async execute(): Promise<ContentItem[]> {
    const currentDaypart = this.getCurrentDaypart();
    console.log(`[Планировщик] Генерируем эфир на 2 часа для слота: ${currentDaypart}`);

    const allContent = await this.contentRepository.getActiveContent();
    
    // Фильтруем по текущему времени
    let activeContent = allContent.filter(c => c.dayparts.includes(currentDaypart));
    if (activeContent.length === 0) activeContent = allContent;

    const baseContent = activeContent.filter(c => c.type === 'BASE');
    if (baseContent.length === 0) throw new Error('Нет базового контента');

    const playlist: ContentItem[] = [];
    
    // История показов для соблюдения частотных ограничений (id видео -> время последнего показа в секундах)
    const history = new Map<string, number>();
    let currentVirtualTime = 0; // Виртуальное время эфира в секундах

    // Генерируем эфир на 2 часа (7200 секунд)
    const TOTAL_BROADCAST_TIME = 7200;

    while (currentVirtualTime < TOTAL_BROADCAST_TIME) {
      // 1. Заполняем BASE
      let currentBaseDuration = 0;
      while (currentBaseDuration < this.rules.baseDurationSec) {
        // Берем базу по кругу
        const baseVideo = baseContent[playlist.length % baseContent.length]!;
        playlist.push(baseVideo);
        currentBaseDuration += baseVideo.durationSec;
        currentVirtualTime += baseVideo.durationSec;
      }

      // 2. Заполняем PROMO-блок
      const promoTemplates = DAYPART_TEMPLATES[currentDaypart] || ['C'];
      // Берем случайный шаблон из предпочтительных для этого времени
      const selectedTemplate = promoTemplates[Math.floor(Math.random() * promoTemplates.length)]!;
      const templateSlots = PROMO_TEMPLATES[selectedTemplate];

      // Слот 1: Всегда Кофейный якорь
      const anchor = activeContent.find(c => c.type === 'COFFEE_ANCHOR');
      if (anchor) {
        playlist.push(anchor);
        currentVirtualTime += anchor.durationSec;
      }

      // Слоты 2 и 3: Ищем подходящий контент с учетом частот
      for (const requiredType of templateSlots) {
        const candidates = activeContent.filter(c => c.type === requiredType);
        let selectedPromo: ContentItem | null = null;

        for (const candidate of candidates) {
          const lastShownTime = history.get(candidate.id) ?? -99999;
          const timeSinceLastShow = currentVirtualTime - lastShownTime;

          // Проверяем кулдаун (в минутах) из базы или дефолтный
          const cooldownSec = (candidate.cooldownMin ?? 60) * 60;

          if (timeSinceLastShow >= cooldownSec) {
            selectedPromo = candidate;
            break;
          }
        }

        // Если нашли подходящий — ставим. Если нет — ставим базу (чтобы не было пустоты)
        if (selectedPromo) {
          playlist.push(selectedPromo);
          history.set(selectedPromo.id, currentVirtualTime);
          currentVirtualTime += selectedPromo.durationSec;
        } else {
          const fallbackBase = baseContent[playlist.length % baseContent.length]!;
          playlist.push(fallbackBase);
          currentVirtualTime += fallbackBase.durationSec;
        }
      }
    }

    return playlist;
  }
}