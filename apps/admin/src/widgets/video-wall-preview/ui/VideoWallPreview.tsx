import { Paper, Box, Stack, Text, SimpleGrid } from '@mantine/core';
import { IconClock, IconQrcode, IconDeviceTv } from '@tabler/icons-react';

interface VideoWallPreviewProps {
  layout: '2_h' | '2_v' | '3_h' | '3_v';
}

export const VideoWallPreview = ({ layout }: VideoWallPreviewProps) => {
  const isHorizontal = layout.endsWith('_h');
  const count = layout.startsWith('2') ? 2 : 3;

  return (
    <Paper withBorder p="md" bg="gray.0">
      <Stack gap="xs">
        {/* Верхний экран (только для вертикальной схемы 3_v и 2_v) */}
        {layout === '3_v' && (
          <Box h={60} bg="blue.1" style={{ borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <IconClock size={20} />
            <Text fw={500}>Верхний (Инфо + QR)</Text>
            <IconQrcode size={20} />
          </Box>
        )}

        {/* Сетка экранов */}
        <SimpleGrid cols={isHorizontal ? count : 1} spacing="xs">
          {Array.from({ length: count }).map((_, i) => {
            // Для 2_v: Верхний и Нижний. Для 2_h: Левый и Правый.
            const isTop = layout === '2_v' && i === 0;
            const isInfo = layout === '2_v' && isTop;

            return (
              <Box 
                key={i} 
                h={isHorizontal ? 120 : 100} 
                bg={isInfo ? "blue.1" : "gray.2"} 
                style={{ borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              >
                {isInfo ? (
                  <>
                    <IconClock size={20} />
                    <Text fw={500}>Инфо + QR</Text>
                    <IconQrcode size={20} />
                  </>
                ) : (
                  <>
                    <IconDeviceTv size={20} />
                    <Text fw={500}>Видео {i + 1}</Text>
                  </>
                )}
              </Box>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
};