/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { RangeRequestsPlugin } from 'workbox-range-requests';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

// 1. Кэшируем видео
registerRoute(
  ({ url }) => url.pathname.endsWith('.mp4') && url.origin === self.location.origin,
  new CacheFirst({
    cacheName: 'videos-cache',
    plugins: [
      new RangeRequestsPlugin(),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// 2. Плейлист: Stale-While-Revalidate с отправкой сообщения при обновлении
registerRoute(
  ({ url }) => url.pathname.endsWith('/playlist'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 7 * 24 * 60 * 60 }),
      {
        // Этот хук срабатывает, когда Workbox обновил кэш новыми данными
        cacheDidUpdate: async ({ cacheName, newResponse }) => {
          if (!newResponse) return;
          
          try {
            const data = await newResponse.json();
            if (data.playlistVersion) {
              // Отправляем сообщение всем открытым вкладкам (приставкам)
              const clients = await self.clients.matchAll();
              clients.forEach(client => {
                client.postMessage({ 
                  type: 'PLAYLIST_UPDATED', 
                  playlistVersion: data.playlistVersion 
                });
              });
            }
          } catch (e) {
            console.warn('SW: Не удалось прочитать обновленный плейлист', e);
          }
        },
      } as any, // Приводим к any, так как типы Workbox иногда строгие
    ],
  })
);