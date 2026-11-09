import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Group, ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { VideoWallPreview } from '@/widgets/video-wall-preview/ui/VideoWallPreview';
import { VideoWallForm } from '@/features/video-wall/ui/VideoWallForm';

export const VideoWallPage = () => {
  const navigate = useNavigate();

  return (
    <Container size="sm" py="xl">
      <Group mb="lg">
        <ActionIcon variant="subtle" onClick={() => navigate(-1)} size="lg">
          <IconArrowLeft size={24} />
        </ActionIcon>
        <Title order={2}>Настройка Медиастены</Title>
      </Group>

      <Text c="dimmed" mb="xl">
        Настройте три экрана, чтобы они работали как единая система. 
        Верхний экран будет показывать часы и QR-код, а два нижних — видео.
      </Text>

      {/* Сборка виджетов */}
      <VideoWallPreview />
      
      <div style={{ marginTop: '2rem' }}>
        <VideoWallForm 
          onSave={() => console.log('Сохранить')} 
          onCancel={() => navigate(-1)} 
        />
      </div>
    </Container>
  );
};