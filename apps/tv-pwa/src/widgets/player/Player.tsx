import { Box, Badge, Stack, Text, Title, ThemeIcon } from '@mantine/core';
import { IconWifiOff } from '@tabler/icons-react';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation-react';
import classes from './Player.module.css';
import { type ContentItem } from '../../pages/home/HomePage';
import { useVideoPlayer } from './lib/useVideoPlayer';

interface PlayerProps {
  videos?: ContentItem[];
  schedule?: any[];
}

export const Player = ({ videos, schedule }: PlayerProps) => {
  const {
    videoRef,
    currentVideo,
    isCurtainClosed,
    handleTimeUpdate,
    handleEnded,
    handleError,
    togglePlayPause,
  } = useVideoPlayer({ videos, schedule });

  const { ref, focused } = useFocusable({
    onEnterPress: togglePlayPause,
  });

  // ЕСЛИ НЕТ ТЕКУЩЕГО ВИДЕО (нет слота в расписании) — ПОКАЗЫВАЕМ ЗАГЛУШКУ
  if (!currentVideo) {
    return (
      <Box 
        w="100vw" 
        h="100vh" 
        bg="black" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white',
          fontFamily: 'Raleway, sans-serif'
        }}
      >
        <Stack align="center" gap="lg">
          <ThemeIcon size={80} radius={40} color="gray" variant="light">
            <IconWifiOff size={48} />
          </ThemeIcon>
          
          <Title order={1} size={48} c="white">Ожидание эфира</Title>
          
          <Text size="xl" c="dimmed" ta="center" maw={600}>
            Расписание на текущее время не найдено. 
            Пожалуйста, проверьте подключение к интернету.
          </Text>
          
          <Text size="lg" c="dimmed" ta="center" maw={600}>
            Если интернет есть, попробуйте перезагрузить приставку (выключите и включите питание).
          </Text>
        </Stack>
      </Box>
    );
  }

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