import { IContentRepository } from '../../domain/ports/IContentRepository.js';
import { ContentItem } from '../../domain/entities/ContentItem.js';

export class StubContentRepository implements IContentRepository {
  async getActiveContent(): Promise<ContentItem[]> {
    const baseVideos = [
      'a-cup-of-foamy-cappuccino-and-black-coffee-on-a-surface.mp4',
      'ai-generated.mp4',
      'atmospheric.mp4',
      'caf.mp4', // Или cafe.mp4, если переименуешь
      'coffee.mp4',
      'cozy-cafe-scene-with-cappuccino-and-latte-art.mp4',
      'cup-of-coffee.mp4',
      'cup-of-coffee-on-table.mp4',
      'dramatic-golden-sunset-with-fluffy-clouds.mp4',
      'drone-footage.mp4',
      'high-angle-shot-of-coffee-based-beverages.mp4',
      'person-pouring-milk-in-a-cup-of-coffee.mp4',
      'sea.mp4',
      'sky.mp4',
      'sunset.mp4'
    ].map((filename, index) => ({
      id: `base_${index}`,
      type: 'BASE' as const,
      url: `/videos-light/${filename}`,
      durationSec: 15, 
      hasAudio: false,
    }));

    return [
      ...baseVideos,
      {
        id: 'anchor_01',
        type: 'COFFEE_ANCHOR',
        url: '/videos-light/cup-of-coffee.mp4',
        durationSec: 6,
        hasAudio: false,
      },
      {
        id: 'promo_coffee_01',
        type: 'COFFEE_OFFER',
        url: '/videos-light/ai-generated.mp4',
        durationSec: 15,
        hasAudio: false,
        maxPerHour: 2,
        cooldownMin: 30,
      },
      {
        id: 'master_anna_01',
        type: 'MASTER',
        url: '/videos-light/sea.mp4',
        durationSec: 15,
        hasAudio: false,
        maxPerHour: 1,
        cooldownMin: 120,
        requiresConsent: true,
      }
    ];
  }
}