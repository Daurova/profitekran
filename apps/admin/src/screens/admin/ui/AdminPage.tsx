'use client';

import { Container, Title, Stack } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { UploadButton } from '@/features/upload-video/ui/UploadButton';
import { VideoList } from '@/widgets/video-list/ui/VideoList';
import { notifications } from '@mantine/notifications';

export const AdminPage = () => {
  const queryClient = useQueryClient();

  const handleUploadSuccess = () => {
    notifications.show({
      title: 'Успех',
      message: 'Видео загружено и добавлено в базу',
      color: 'green',
    });
    // Инвалидируем кэш — React Query сам перезапросит список видео
    queryClient.invalidateQueries({ queryKey: ['videos'] });
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">Управление видео</Title>
      
      <Stack gap="xl">
        <UploadButton onSuccess={handleUploadSuccess} />
        <VideoList />
      </Stack>
    </Container>
  );
};