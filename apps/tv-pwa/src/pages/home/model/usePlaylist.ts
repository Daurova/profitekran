import { useEffect, useState } from 'react';
import { fetchPlaylist } from '../../../shared/api/playlist';
import { getDeviceId } from '../../../shared/lib/device';
import { type ContentItem } from '../HomePage';

export const usePlaylist = () => {
  const [videos, setVideos] = useState<ContentItem[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isWall, setIsWall] = useState(false);
  const [wallRole, setWallRole] = useState<string | null>(null);

  const load = async (): Promise<boolean> => {
    try {
      const deviceId = getDeviceId();
      const data = await fetchPlaylist(deviceId);

      if (data.status === 'unauthorized') {
        setIsUnauthorized(true);
        setVideos([]);
        setSchedule([]);
        localStorage.removeItem('cached_playlist');
        localStorage.removeItem('cached_schedule');
        setIsLoading(false);
        return false;
      }

      // 1. Если это стена (пришел schedule)
      if (data.status === 'success' && data.schedule) {
        setIsUnauthorized(false);
        setIsWall(true);
        setWallRole(data.wallRole || null);
        setSchedule(data.schedule);
        setIsLoading(false);

        localStorage.setItem('cached_schedule', JSON.stringify(data.schedule));
        localStorage.setItem('cached_is_wall', 'true');
        localStorage.setItem('cached_wall_role', data.wallRole || '');

        return true;
      }

           // 2. Если это одиночный экран (пришел data)
      if (data.status === 'success' && data.data) {
        setIsUnauthorized(false);
        setIsWall(data.isWall || false);
        setWallRole(data.wallRole || null);
        setVideos(data.data);

        // ПРОВЕРКА ВЕРСИИ ПЛЕЙЛИСТА
        const serverVersion = data.playlistVersion || 1;
        const cachedVersion = Number(localStorage.getItem('playlist_version') || '1');

        if (serverVersion > cachedVersion) {
          console.log(`Версия плейлиста изменилась: ${cachedVersion} -> ${serverVersion}. Сбрасываем кэш...`);
          localStorage.setItem('playlist_version', String(serverVersion));
          
          // Снимаем Service Worker и перезагружаем страницу
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
            }
          }
          
          // Ждем чуть-чуть и перезагружаем
          setTimeout(() => window.location.reload(), 500);
          return true;
        }

        localStorage.setItem('cached_playlist', JSON.stringify(data.data));
        localStorage.setItem('cached_is_wall', String(data.isWall || false));
        localStorage.setItem('cached_wall_role', data.wallRole || '');

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_VIDEOS',
            videos: data.data.map((item: any) => item.url),
          });
        }
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      // Офлайн-режим: пытаемся взять из кэша
      const cachedSchedule = localStorage.getItem('cached_schedule');
      const cachedPlaylist = localStorage.getItem('cached_playlist');

      if (cachedSchedule) {
        setSchedule(JSON.parse(cachedSchedule));
        setIsWall(true);
        setWallRole(localStorage.getItem('cached_wall_role'));
      } else if (cachedPlaylist) {
        setVideos(JSON.parse(cachedPlaylist));
        setIsWall(localStorage.getItem('cached_is_wall') === 'true');
        setWallRole(localStorage.getItem('cached_wall_role'));
      } else {
        setIsUnauthorized(true);
      }
      setIsLoading(false);
      return false;
    }
    return false;
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isUnauthorized) {
      interval = setInterval(async () => {
        const isActivated = await load();
        if (isActivated) clearInterval(interval);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isUnauthorized]);

  return { videos, schedule, isLoading, isUnauthorized, isWall, wallRole };
};