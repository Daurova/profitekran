import { useEffect, useState } from 'react';
import { fetchPlaylist } from '../../../shared/api/playlist';
import { getDeviceId } from '../../../shared/lib/device';
import { ContentItem } from '../HomePage';

export const usePlaylist = () => {
  const [videos, setVideos] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const load = async (): Promise<boolean> => {
    try {
      const deviceId = getDeviceId();
      const data = await fetchPlaylist(deviceId);

      // Если сервер вернул 403
      if (data.status === 'unauthorized') {
        setIsUnauthorized(true);
        setIsLoading(false);
        return false;
      }

      if (data.status === 'success' && data.data) {
        setIsUnauthorized(false);
        setVideos(data.data);
        
        localStorage.setItem('cached_playlist', JSON.stringify(data.data));
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_VIDEOS',
            videos: data.data.map((item) => item.url),
          });
        }
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      // Если произошла ошибка сети, пробуем взять кэш
      const cached = localStorage.getItem('cached_playlist');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0) {
          setVideos(parsed);
        } else {
          // Если кэш пустой — показываем экран активации
          setIsUnauthorized(true);
        }
      } else {
        // Если кэша нет вообще — показываем экран активации
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

  return { videos, isLoading, isUnauthorized };
};