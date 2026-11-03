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

export const HomePage = () => {
  const [videos, setVideos] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = '/api/playlist';

  useEffect(() => {
    const fetchPlaylist = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const response = await fetch(API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Ошибка сервера');
        
        const json = await response.json();
        
        if (json.status === 'success') {
          // ТЕПЕРЬ СОХРАНЯЕМ ВЕСЬ ОБЪЕКТ, А НЕ ТОЛЬКО URL
          setVideos(json.data);
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