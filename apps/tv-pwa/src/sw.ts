/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { RangeRequestsPlugin } from 'workbox-range-requests';

declare let self: ServiceWorkerGlobalScope;

// 1. Кэшируем сам сайт
precacheAndRoute(self.__WB_MANIFEST);

// 2. Плагин, который заставляет сервер отдать файл ЦЕЛИКОМ (200), а не кусками (206)
const forceFullDownloadPlugin = {
  requestWillFetch: async ({ request }: { request: Request }) => {
    const headers = new Headers(request.headers);
    // Удаляем заголовки, из-за которых сервер отвечает 304 (Not Modified)
    headers.delete('If-None-Match');
    headers.delete('If-Modified-Since');
    // САМОЕ ВАЖНОЕ: Удаляем заголовок Range, чтобы скачался весь файл
    headers.delete('Range'); 
    
    return new Request(request.url, {
      headers,
      method: request.method,
      mode: request.mode,
      credentials: request.credentials,
      redirect: request.redirect,
      referrer: request.referrer,
      referrerPolicy: request.referrerPolicy,
      integrity: request.integrity,
      cache: 'reload',
    });
  },
};

// 3. Кэшируем ВИДЕО
registerRoute(
  ({ url }) => url.pathname.endsWith('.mp4'),
  new CacheFirst({
    cacheName: 'videos-cache',
    plugins: [
      new RangeRequestsPlugin(), // Отдает кусочки из кэша
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
      forceFullDownloadPlugin, // Скачивает целиком для кэша
    ],
  })
);

// 4. Кэшируем список видео (API)
registerRoute(
  ({ url }) => url.pathname.endsWith('/playlist'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);