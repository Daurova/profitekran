import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Group, ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { VideoWallForm } from '@/features/video-wall/ui/VideoWallForm';
import { createWall } from '@/shared/api/client';

export const VideoWallPage = () => {
  const navigate = useNavigate();
  const [layout, setLayout] = useState<string>('3_v');
  const [,setIsSaving] = useState(false);

  const handleSave = async (data: any) => {
    setIsSaving(true);
    try {
      // Отправляем данные на бэкенд
      await createWall(data);
      
      notifications.show({
        title: 'Успех',
        message: 'Медиастена успешно создана',
        color: 'green',
      });
      navigate(-1); // Возвращаемся в админку
    } catch (err) {
      notifications.show({
        title: 'Ошибка',
        message: err instanceof Error ? err.message : 'Не удалось создать стену',
        color: 'red',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Group mb="lg">
        <ActionIcon variant="subtle" onClick={() => navigate(-1)} size="lg">
          <IconArrowLeft size={24} />
        </ActionIcon>
        <Title order={2}>Настройка Медиастены</Title>
      </Group>

      <Text c="dimmed" mb="xl">
        Соберите стену из трех экранов, настройте контент и нажмите «Собрать стену».
      </Text>
      
      <VideoWallForm 
        layout={layout}
        setLayout={setLayout}
        onSave={handleSave} 
        onCancel={() => navigate(-1)} 
      />
    </Container>
  );
};