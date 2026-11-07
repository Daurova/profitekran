import { Box, Loader, Center } from '@mantine/core';
import { Player } from '../../widgets/player/Player';
import { TVOverlay } from '../../widgets/tv-overlay/TVOverlay';
import { useEffect, useState } from 'react';

// Выносим тип наверх, чтобы использовать его в плеере
export interface ContentItem {
  id: string;
  type: string;
  url: string;
  durationSec: number;
  hasAudio: boolean;
}

// Функция для получения или генерации ID устройства (6 символов)
const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    // Генерируем 6-значный код (например: A1B2C3)
    deviceId = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

export const HomePage = () => {
  const [videos, setVideos] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      // Получаем ID устройства и передаем его на сервер
      const deviceId = getDeviceId();
      const API_URL = `/api/playlist?deviceId=${deviceId}`;

      try {
        const response = await fetch(API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Ошибка сервера');
        
        const json = await response.json();
        
        if (json.status === 'success') {
          // ТЕПЕРЬ СОХРАНЯЕМ ВЕСЬ ОБЪЕКТ, А НЕ ТОЛЬКО URL
          setVideos(json.data);
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'CACHE_VIDEOS',
              videos: json.data.map((item: any) => item.url),
            });
          }
          localStorage.setItem('cached_playlist', JSON.stringify(json.data));
        }
      } catch (err) {
        const cached = localStorage.getItem('cached_playlist');
        if (cached) setVideos(JSON.parse(cached));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, []);

  if (isLoading) return <Box w="100vw" h="100vh" bg="black"><Center h="100%"><Loader color="blue" size="xl" type="dots" /></Center></Box>;
  if (videos.length === 0) return <Box w="100vw" h="100vh" bg="black" style={{ color: 'white', textAlign: 'center', paddingTop: '40vh' }}>Нет контента</Box>;

  return (
    <Box w="100vw" h="100vh" pos="relative" bg="black">
      {/* Передаем объекты */}
      <Player videos={videos} />
      <TVOverlay />
    </Box>
  );
};