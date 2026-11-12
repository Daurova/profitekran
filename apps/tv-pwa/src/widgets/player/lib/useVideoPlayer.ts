import { useEffect, useRef, useState } from 'react';
import { type ContentItem } from '../../../pages/home/HomePage';
import { getVideo, saveVideo } from '../../../shared/lib/db';

interface UseVideoPlayerParams {
  videos?: ContentItem[];
  schedule?: any[];
}

export const useVideoPlayer = ({ videos, schedule }: UseVideoPlayerParams) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCurtainClosed, setIsCurtainClosed] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Определяем текущее видео
  let currentVideo: any = null;
  
  if (schedule && schedule.length > 0) {
    const now = Date.now();
    const currentSlot = schedule.find(s => now >= s.startTime && now < s.endTime);
    if (currentSlot) {
      currentVideo = {
        url: currentSlot.url,
        type: currentSlot.type,
        id: currentSlot.startTime.toString(),
      };
    }
  } else if (videos && videos.length > 0) {
    currentVideo = videos[currentIndex];
  }

  // 1. Загрузка из IndexedDB или из сети
  useEffect(() => {
    const loadVideo = async () => {
      const video = videoRef.current;
      if (!video || !currentVideo) return;

      if (video.src && video.src.includes(currentVideo.url)) return;

      const cachedBlob = await getVideo(currentVideo.url);

      if (cachedBlob) {
        video.src = URL.createObjectURL(cachedBlob);
      } else {
        video.src = currentVideo.url;
        
        fetch(currentVideo.url)
          .then(res => res.blob())
          .then(blob => saveVideo(currentVideo.url, blob))
          .catch(err => console.warn('Ошибка кэширования:', err));
      }

      video.play().catch(e => { if (e.name !== 'AbortError') console.error(e); });
    };

    loadVideo();
  }, [currentVideo?.url]);

  // 2. Принудительная синхронизация по времени (для стены)
  useEffect(() => {
    if (!schedule || schedule.length === 0) return;
    
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || isPaused) return;

      const now = Date.now();
      const currentSlot = schedule.find(s => now >= s.startTime && now < s.endTime);

      if (currentSlot) {
        const expectedSec = (now - currentSlot.startTime) / 1000;
        if (Math.abs(video.currentTime - expectedSec) > 2) {
          video.currentTime = expectedSec;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [schedule, isPaused]);

  // 3. Управление паузой
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPaused) video.pause();
    else video.play().catch(e => { if (e.name !== 'AbortError') console.error(e); });
  }, [isPaused]);

  // 4. WATCHDOG
  useEffect(() => {
    let lastTime = 0;
    let stuckCounter = 0;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || isPaused) return;

      if (video.currentTime === lastTime) {
        stuckCounter++;
        if (stuckCounter >= 30) {
          console.warn('Watchdog: Видео зависло, перезагружаем...');
          window.location.reload();
        }
      } else {
        lastTime = video.currentTime;
        stuckCounter = 0;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // 5. Занавес
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || video.duration === 0) return;
    const timeLeft = video.duration - video.currentTime;
    if (video.currentTime > 0.2) setIsCurtainClosed(false);
    if (timeLeft < 0.8) setIsCurtainClosed(true);
  };

  // 6. Переключение (для обычного режима) + ПРОВЕРКА ВЕРСИИ
  const handleEnded = async () => {
    if (videos && videos.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }

    // ПРОВЕРКА ВЕРСИИ ПЛЕЙЛИСТА (для одиночных экранов)
    if (!schedule || schedule.length === 0) {
      try {
        const deviceId = localStorage.getItem('device_id');
        if (!deviceId) return;

        const res = await fetch(`/api/playlist?deviceId=${deviceId}`);
        const data = await res.json();

        if (data.playlistVersion) {
          const cachedVersion = Number(localStorage.getItem('playlist_version') || '1');
          if (data.playlistVersion > cachedVersion) {
            console.log('Новая версия плейлиста! Перезагружаем...');
            localStorage.setItem('playlist_version', String(data.playlistVersion));
            
            if ('serviceWorker' in navigator) {
              const regs = await navigator.serviceWorker.getRegistrations();
              for (const reg of regs) await reg.unregister();
            }
            
            window.location.reload();
          }
        }
      } catch (e) {
        // Если ошибка сети, просто игнорируем
      }
    }
  };

  // 7. Обработка ошибок
  const handleError = () => {
    console.warn(`Ошибка загрузки: ${currentVideo?.url}, пропускаем...`);
    if (videos && videos.length > 0) {
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % videos.length);
      }, 1000);
    }
  };

  const togglePlayPause = () => setIsPaused((prev) => !prev);

  return {
    videoRef,
    currentVideo,
    isCurtainClosed,
    handleTimeUpdate,
    handleEnded,
    handleError,
    togglePlayPause,
  };
};