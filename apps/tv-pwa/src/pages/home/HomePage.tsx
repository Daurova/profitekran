import { Box, Loader, Center, Text, Title, Stack, Code } from '@mantine/core';
import { Player } from '../../widgets/player/Player';
import { TVOverlay } from '../../widgets/tv-overlay/TVOverlay';
import { InfoScreen } from '../../widgets/info-screen/ui/InfoScreen';
import { usePlaylist } from './model/usePlaylist';
import { getDeviceId } from '../../shared/lib/device';

export interface ContentItem {
  id: string;
  type: string;
  url: string;
  durationSec: number;
  hasAudio: boolean;
}

export const HomePage = () => {
  // Достаем schedule вместо infoText и qrUrl
  const { videos, schedule, isLoading, isUnauthorized, isWall, wallRole } = usePlaylist();

  if (isLoading) return <Box w="100vw" h="100vh" bg="black"><Center h="100%"><Loader color="blue" size="xl" type="dots" /></Center></Box>;

  if (isUnauthorized) {
    const deviceId = getDeviceId();
    return (
      <Box w="100vw" h="100vh" bg="black" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <Stack align="center" gap="xl">
          <Title order={1} size={48}>Активация экрана</Title>
          <Text size="xl" c="dimmed" ta="center">
            Для начала работы введите этот код в админке:
          </Text>
          <Code color="blue" style={{ fontSize: '80px', padding: '20px 40px', letterSpacing: '10px' }}>
            {deviceId}
          </Code>
          <Text size="lg" c="dimmed">После привязки экран обновится автоматически.</Text>
          <Loader color="blue" size="md" mt="xl" />
        </Stack>
      </Box>
    );
  }

  // ЕСЛИ ЭТО ИНФО-ЭКРАН — ПОКАЗЫВАЕМ ЧАСЫ И QR (ПЕРЕДАЕМ SCHEDULE)
  if (isWall && wallRole === 'INFO') {
    return <InfoScreen schedule={schedule} />;
  }

  if (videos.length === 0) return <Box w="100vw" h="100vh" bg="black" style={{ color: 'white', textAlign: 'center', paddingTop: '40vh' }}>Нет контента</Box>;

  return (
    <Box w="100vw" h="100vh" pos="relative" bg="black">
      <Player videos={videos} />
      <TVOverlay />
    </Box>
  );
};