'use client';

import { Container, Title, Stack } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { VideoList } from '@/widgets/video-list/ui/VideoList';
import { notifications } from '@mantine/notifications';
import { AuthGuard } from '@/features/auth-by-token/ui/AuthGuard';
import { UploadButton } from '@/features/upload-video/ui/UploadButton';

export const AdminPage = () => {
  const queryClient = useQueryClient();

  const handleUploadSuccess = () => {
    notifications.show({
      title: 'Успех',
      message: 'Видео загружено и добавлено в базу',
      color: 'green',
    });
    queryClient.invalidateQueries({ queryKey: ['videos'] });
  };

  return (
    <AuthGuard>
      <Container size="lg" py="xl">
        <Title order={1} mb="xl">Управление видео</Title>
        
        <Stack gap="xl">
          <UploadButton onSuccess={handleUploadSuccess} />
          <VideoList />
        </Stack>
      </Container>
    </AuthGuard>
  );
};