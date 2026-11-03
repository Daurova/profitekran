import { Box, Badge } from '@mantine/core';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation-react';
import classes from './Player.module.css';
import { type ContentItem } from '../../pages/home/HomePage';
import { useVideoPlayer } from './lib/useVideoPlayer'; // <-- Импортируем наш мозг

interface PlayerProps {
  videos: ContentItem[];
}

export const Player = ({ videos }: PlayerProps) => {
  // Вся сложная логика теперь живет в хуке!
  const {
    videoRef,
    currentVideo,
    isCurtainClosed,
    handleTimeUpdate,
    handleEnded,
    handleError,
    togglePlayPause,
  } = useVideoPlayer(videos);

  const { ref, focused } = useFocusable({
    onEnterPress: togglePlayPause,
  });

  if (videos.length === 0) return null;

  return (
    <Box ref={ref} w="100vw" h="100vh" bg="black" style={{ position: 'relative', outline: focused ? '4px solid #228be6' : 'none' }}>
      <video 
        ref={videoRef} 
        className={classes.video} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={handleEnded} 
        onError={handleError}
        autoPlay 
        muted 
        playsInline 
        preload="auto" 
      />
      
      {/* Бейдж рекламы */}
      {currentVideo.type !== 'BASE' && !isCurtainClosed && (
        <Badge color="red" size="xl" style={{ position: 'absolute', top: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, fontSize: '24px', padding: '20px' }}>
          РЕКЛАМА: {currentVideo.type}
        </Badge>
      )}

      {/* Занавес */}
      <div className={`${classes.curtain} ${isCurtainClosed ? classes.curtainVisible : classes.curtainHidden}`} />
    </Box>
  );
};