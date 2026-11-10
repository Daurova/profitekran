import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Group, ActionIcon, Card, SimpleGrid, Badge, Loader, Center, Divider } from '@mantine/core';
import { IconArrowLeft, IconDeviceTv } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { VideoWallForm } from '@/features/video-wall/ui/VideoWallForm';
import { createWall, fetchWalls } from '@/shared/api/client';

export const VideoWallPage = () => {
  const navigate = useNavigate();
  const [layout, setLayout] = useState<string>('3_v');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['walls'],
    queryFn: fetchWalls,
  });

  const walls = data?.data || [];

  const handleSave = async (formData: any) => {
    try {
      await createWall(formData);
      notifications.show({ title: 'Успех', message: 'Медиастена создана', color: 'green' });
      refetch();
    } catch (err) {
      notifications.show({ title: 'Ошибка', message: 'Не удалось создать стену', color: 'red' });
    }
  };

  return (
    <Container size="md" py="xl">
      <Group mb="lg">
        <ActionIcon variant="subtle" onClick={() => navigate(-1)} size="lg">
          <IconArrowLeft size={24} />
        </ActionIcon>
        <Title order={2}>Медиастены</Title>
      </Group>

      {/* СПИСОК ГОТОВЫХ СТЕН (СВЕРХУ) */}
      <Card withBorder mb="xl">
        <Text fw={500} mb="md">Мои готовые стены</Text>
        {isLoading ? (
          <Center h={100}><Loader /></Center>
        ) : walls.length === 0 ? (
          <Text c="dimmed" ta="center" py="md">У вас пока нет созданных стен.</Text>
        ) : (
          <SimpleGrid cols={2} spacing="md">
            {walls.map((wall: any) => (
              <Card key={wall.id} withBorder p="md" bg="gray.0">
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <IconDeviceTv size={20} />
                    <Text fw={500}>{wall.name}</Text>
                  </Group>
                  <Badge color="blue">{wall.layoutType}</Badge>
                </Group>
                <Text size="sm" c="dimmed">Экранов: {wall.screens?.length || 0}</Text>
                <Text size="sm" c="dimmed">Контента: {wall.items?.length || 0}</Text>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Card>

      <Divider my="xl" label="Создать новую стену" labelPosition="center" />

      {/* ФОРМА СОЗДАНИЯ (ВСЕГДА ОТКРЫТА) */}
      <VideoWallForm 
        layout={layout}
        setLayout={setLayout}
        onSave={handleSave} 
        onCancel={() => navigate(-1)} 
      />
    </Container>
  );
};