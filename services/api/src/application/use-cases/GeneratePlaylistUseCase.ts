import { ContentItem } from '../../domain/entities/ContentItem.js';
import { IContentRepository } from '../../domain/ports/IContentRepository.js';
import { 
  DEFAULT_BROADCAST_RULES, 
  BroadcastRules, 
  PROMO_TEMPLATES, 
  DAYPART_TEMPLATES 
} from '../../domain/rules/BroadcastRules.js';
import { getVideoUrl } from '../../infrastructure/s3/S3Service.js';

export class GeneratePlaylistUseCase {
  constructor(
    private readonly contentRepository: IContentRepository,
    private readonly rules: BroadcastRules = DEFAULT_BROADCAST_RULES // <-- ИСПРАВЛЕНО
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

  async execute(tenantId?: string): Promise<ContentItem[]> {
    if (!tenantId) {
      throw new Error('Не передан ID клиента (tenantId)');
    }

    const currentDaypart = this.getCurrentDaypart();
    console.log(`[Планировщик] Генерируем эфир для тенанта: ${tenantId} (слот: ${currentDaypart})`);

    const allContent = await this.contentRepository.getActiveContent(tenantId);
    
    let activeContent = allContent.filter(c => c.dayparts.includes(currentDaypart));
    if (activeContent.length === 0) activeContent = allContent;

    const baseContent = activeContent.filter(c => c.type === 'BASE');
    if (baseContent.length === 0) throw new Error('Нет базового контента для этого клиента');

    const playlist: ContentItem[] = [];
    const history = new Map<string, number[]>();
    let currentVirtualTime = 0; 
    const TOTAL_BROADCAST_TIME = 7200;
    let baseIndex = 0;

    // УНИВЕРСАЛЬНАЯ ПРОВЕРКА: можно ли показать ролик?
    const canShow = (item: ContentItem, currentTime: number): boolean => {
      const showTimes = history.get(item.id) || [];

      // 1. Проверяем кулдаун (cooldownMin)
      if (item.cooldownMin) {
        const lastShown = showTimes[showTimes.length - 1] ?? -99999;
        const timeSinceLastShow = currentTime - lastShown;
        if (timeSinceLastShow < item.cooldownMin * 60) return false;
      }

      // 2. Проверяем лимит показов в час (maxPerHour)
      if (item.maxPerHour) {
        const showsInLastHour = showTimes.filter(time => currentTime - time < 3600);
        if (showsInLastHour.length >= item.maxPerHour) return false;
      }

      return true;
    };

    while (currentVirtualTime < TOTAL_BROADCAST_TIME) {
      // 1. Заполняем BASE
      let currentBaseDuration = 0;
      while (currentBaseDuration < this.rules.baseDurationSec) {
        const baseVideo = baseContent[baseIndex % baseContent.length]!;
        playlist.push(baseVideo);
        currentBaseDuration += baseVideo.durationSec;
        currentVirtualTime += baseVideo.durationSec;
        baseIndex++;
      }

      // 2. Заполняем PROMO-блок
      const promoTemplates = DAYPART_TEMPLATES[currentDaypart] || ['C'];
      const selectedTemplate = promoTemplates[Math.floor(Math.random() * promoTemplates.length)]!;
      const templateSlots = PROMO_TEMPLATES[selectedTemplate];

      for (const requiredType of templateSlots) {
        // Ищем всех кандидатов, которых СЕЙЧАС МОЖНО показать (с учетом лимитов)
        const candidates = activeContent.filter(
          c => c.type === requiredType && canShow(c, currentVirtualTime)
        );

        let selectedPromo: ContentItem | null = null;
        if (candidates.length > 0) {
          selectedPromo = candidates[Math.floor(Math.random() * candidates.length)]!;
        }

        if (selectedPromo) {
          playlist.push(selectedPromo);
          
          // Добавляем время показа в историю
          const times = history.get(selectedPromo.id) || [];
          times.push(currentVirtualTime);
          history.set(selectedPromo.id, times);
          
          currentVirtualTime += selectedPromo.durationSec;
        } else {
          // Если не нашли — ставим базу
          const fallbackBase = baseContent[baseIndex % baseContent.length]!;
          playlist.push(fallbackBase);
          currentVirtualTime += fallbackBase.durationSec;
          baseIndex++;
        }
      }
    }

    return playlist.map(item => ({
      ...item,
      url: getVideoUrl(item.url),
    }));
  }
}