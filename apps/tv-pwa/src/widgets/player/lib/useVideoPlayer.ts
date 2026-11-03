import { useEffect, useRef, useState } from 'react';
import { type ContentItem } from '../../../pages/home/HomePage';

export const useVideoPlayer = (videos: ContentItem[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCurtainClosed, setIsCurtainClosed] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentVideo = videos[currentIndex];

  // 1. Загрузка и запуск нового видео
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideo) return;
    video.src = currentVideo.url;
    video.play().catch(e => { if (e.name !== 'AbortError') console.error(e); });
  }, [currentVideo]);

  // 2. Управление паузой
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPaused) video.pause();
    else video.play().catch(e => { if (e.name !== 'AbortError') console.error(e); });
  }, [isPaused]);

  // 3. WATCHDOG (Сторожевой таймер — защита от зависаний)
  useEffect(() => {
    let lastTime = 0;
    let stuckCounter = 0;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || isPaused) return;

      if (video.currentTime === lastTime) {
        stuckCounter++;
        if (stuckCounter >= 10) {
          console.error('Watchdog: Видео зависло, перезагружаем страницу');
          window.location.reload();
        }
      } else {
        lastTime = video.currentTime;
        stuckCounter = 0;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // 4. Обработка времени (для занавеса)
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || video.duration === 0) return;
    const timeLeft = video.duration - video.currentTime;
    if (video.currentTime > 0.2) setIsCurtainClosed(false);
    if (timeLeft < 0.8) setIsCurtainClosed(true);
  };

  // 5. Переключение на следующее видео
  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  // 6. ОБРАБОТЧИК ОШИБОК (Пропуск битых файлов)
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