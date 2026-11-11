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
  
  // ДОБАВИЛИ: стейты для инфо-экрана
  const [infoText, setInfoText] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');

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

      // Если это инфо-экран (нет data, но есть infoText)
      if (data.status === 'success' && data.isWall && data.wallRole === 'INFO') {
        setIsUnauthorized(false);
        setIsWall(true);
        setWallRole('INFO');
        setInfoText(data.infoText || '');
        setQrUrl(data.qrUrl || '');

        localStorage.setItem('cached_is_wall', 'true');
        localStorage.setItem('cached_wall_role', 'INFO');
        localStorage.setItem('cached_info_text', data.infoText || '');
        localStorage.setItem('cached_qr_url', data.qrUrl || '');
        
        setIsLoading(false);
        return true;
      }

      // Если это видео-экран (или одиночный)
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
      const cachedIsWall = localStorage.getItem('cached_is_wall') === 'true';
      const cachedRole = localStorage.getItem('cached_wall_role');

      if (cachedIsWall && cachedRole === 'INFO') {
        setInfoText(localStorage.getItem('cached_info_text') || '');
        setQrUrl(localStorage.getItem('cached_qr_url') || '');
        setIsWall(true);
        setWallRole('INFO');
      } else if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0) {
          setVideos(parsed);
          setIsWall(cachedIsWall);
          setWallRole(cachedRole);
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

  return { videos, isLoading, isUnauthorized, isWall, wallRole, infoText, qrUrl };
};