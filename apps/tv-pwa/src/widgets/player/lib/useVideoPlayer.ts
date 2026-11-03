import { useEffect, useRef, useState } from 'react';
import { type ContentItem } from '../../../pages/home/HomePage';
import { getVideo, saveVideo } from '../../../shared/lib/db'; // <-- Добавили импорт

export const useVideoPlayer = (videos: ContentItem[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCurtainClosed, setIsCurtainClosed] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentVideo = videos[currentIndex];

  // 1. Загрузка из IndexedDB или из сети
  useEffect(() => {
    const loadVideo = async () => {
      const video = videoRef.current;
      if (!video || !currentVideo) return;

      // Пытаемся достать из памяти
      const cachedBlob = await getVideo(currentVideo.url);

      if (cachedBlob) {
        video.src = URL.createObjectURL(cachedBlob);
      } else {
        video.src = currentVideo.url;
        
        // Скачиваем в фоне и сохраняем
        fetch(currentVideo.url)
          .then(res => res.blob())
          .then(blob => saveVideo(currentVideo.url, blob))
          .catch(err => console.warn('Ошибка кэширования видео:', err));
      }

      video.play().catch(e => { if (e.name !== 'AbortError') console.error(e); });
    };

    loadVideo();
  }, [currentVideo]);

  // 2. Управление паузой
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPaused) video.pause();
    else video.play().catch(e => { if (e.name !== 'AbortError') console.error(e); });
  }, [isPaused]);

  // 3. WATCHDOG (Сторожевой таймер)
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

  // 4. Занавес
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || video.duration === 0) return;
    const timeLeft = video.duration - video.currentTime;
    if (video.currentTime > 0.2) setIsCurtainClosed(false);
    if (timeLeft < 0.8) setIsCurtainClosed(true);
  };

  // 5. Переключение
  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  // 6. Обработка ошибок
  const handleError = () => {
    console.warn(`Ошибка загрузки: ${currentVideo?.url}, пропускаем...`);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 1000);
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