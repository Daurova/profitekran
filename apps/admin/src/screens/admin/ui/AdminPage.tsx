import { Container, Title, Stack, Group, Text, Button } from '@mantine/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { VideoList } from '@/widgets/video-list/ui/VideoList';
import { notifications } from '@mantine/notifications';
import { UploadButton } from '@/features/upload-video/ui/UploadButton';
import { fetchMe } from '@/shared/api/client';
import { BindScreenForm } from '@/features/bind-screen/ui/BindScreenForm'; // <-- Импортируем новую фичу
import { useNavigate } from 'react-router-dom';
import { logout } from '@/shared/api/client';
import { IconLogout } from '@tabler/icons-react';


export const AdminPage = () => {
  const queryClient = useQueryClient();

  const { data: userData } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
  });

  const handleUploadSuccess = () => {
    notifications.show({
      title: 'Успех',
      message: 'Видео загружено и добавлено в базу',
      color: 'green',
    });
    queryClient.invalidateQueries({ queryKey: ['videos'] });
  };
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Панель управления</Title>
        {userData?.user && (
          <Text size="md" c="dimmed">
            Клиент: <Text span fw={700} c="blue">{userData.user.tenantName}</Text>
          </Text>
        )}
        <Button variant="light" color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
            Выйти
        </Button>
      </Group>
      
      <Stack gap="xl">
        {/* Привязка экрана вынесена в отдельный компонент */}
        <BindScreenForm />

        {/* Загрузка видео */}
        <UploadButton onSuccess={handleUploadSuccess} />

        {/* Список видео */}
        <VideoList />
      </Stack>
    </Container>
  );
};