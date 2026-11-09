import { Paper, Box, Stack, Text } from '@mantine/core';
import { IconClock, IconQrcode } from '@tabler/icons-react';

export const VideoWallPreview = () => {
  return (
    <Paper withBorder p="md" bg="gray.0">
      <Stack gap="xs">
        <Box h={80} bg="blue.1" style={{ borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <IconClock size={24} />
          <Text fw={500}>Верхний экран (Инфо + QR)</Text>
          <IconQrcode size={24} />
        </Box>
        <Box h={120} bg="gray.2" style={{ borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text fw={500}>Средний экран (Видео)</Text>
        </Box>
        <Box h={120} bg="gray.2" style={{ borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text fw={500}>Нижний экран (Видео)</Text>
        </Box>
      </Stack>
    </Paper>
  );
};