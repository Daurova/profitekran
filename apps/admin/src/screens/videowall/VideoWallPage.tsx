import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Group, ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { VideoWallForm } from '@/features/video-wall/ui/VideoWallForm';

export const VideoWallPage = () => {
  const navigate = useNavigate();
  const [layout, setLayout] = useState<string>('3_v');

  const handleSave = (codes: Record<string, string>) => {
    console.log('Отправляем на бэкенд:', { layout, codes });
    alert('Данные собраны! Смотри консоль (F12).');
    navigate(-1);
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
        Кликните на нужный экран и введите код, который отображается на вашем физическом телевизоре.
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