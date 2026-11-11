import { useEffect, useState } from 'react';
import { fetchPlaylist } from '../../../shared/api/playlist';
import { getDeviceId } from '../../../shared/lib/device';
import { type ContentItem } from '../HomePage';

export const usePlaylist = () => {
  const [videos, setVideos] = useState<ContentItem[]>([]);
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
        localStorage.removeItem('cached_playlist');
        setIsLoading(false);
        return false;
      }

      if (data.status === 'success' && data.data) {
        setIsUnauthorized(false);
        setVideos(data.data);
        setIsWall(data.isWall || false);
        setWallRole(data.wallRole || null);

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
      // При ошибке сети (если нет интернета) берем кэш
      const cached = localStorage.getItem('cached_playlist');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0) {
          setVideos(parsed);
          setIsWall(localStorage.getItem('cached_is_wall') === 'true');
          setWallRole(localStorage.getItem('cached_wall_role'));
        } else {
          setIsUnauthorized(true);
        }
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

  return { videos, isLoading, isUnauthorized, isWall, wallRole };
};