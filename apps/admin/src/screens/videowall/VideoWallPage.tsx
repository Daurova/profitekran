import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Group, ActionIcon, Button, Card, SimpleGrid, Badge, Loader, Center } from '@mantine/core';
import { IconArrowLeft, IconPlus, IconDeviceTv } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { VideoWallForm } from '@/features/video-wall/ui/VideoWallForm';
import { createWall, fetchWalls } from '@/shared/api/client';

export const VideoWallPage = () => {
  const navigate = useNavigate();
  const [layout, setLayout] = useState<string>('3_v');
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Запрашиваем список стен
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['walls'],
    queryFn: fetchWalls,
  });

  const walls = data?.data || [];

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      await createWall(formData);
      notifications.show({ title: 'Успех', message: 'Медиастена создана', color: 'green' });
      setIsCreating(false); // Закрываем форму
      refetch(); // Обновляем список
    } catch (err) {
      notifications.show({ title: 'Ошибка', message: 'Не удалось создать стену', color: 'red' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Group mb="lg">
        <ActionIcon variant="subtle" onClick={() => navigate(-1)} size="lg">
          <IconArrowLeft size={24} />
        </ActionIcon>
        <Title order={2}>Медиастены</Title>
        <Button 
          ml="auto" 
          leftSection={<IconPlus size={16} />} 
          onClick={() => setIsCreating(!isCreating)}
          variant={isCreating ? 'default' : 'filled'}
        >
          {isCreating ? 'Отмена' : 'Создать стену'}
        </Button>
      </Group>

      {/* Если нажали "Создать" — показываем форму */}
      {isCreating ? (
        <VideoWallForm 
          layout={layout}
          setLayout={setLayout}
          onSave={handleSave} 
          onCancel={() => setIsCreating(false)} 
        />
      ) : (
        /* Иначе показываем список стен */
        <>
          {isLoading ? (
            <Center h={200}><Loader /></Center>
          ) : walls.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">У вас пока нет созданных стен. Нажмите «Создать стену».</Text>
          ) : (
            <SimpleGrid cols={2} spacing="md">
              {walls.map((wall: any) => (
                <Card key={wall.id} withBorder p="md">
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
        </>
      )}
    </Container>
  );
};