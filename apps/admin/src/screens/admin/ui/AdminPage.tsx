import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Group, ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { VideoWallPreview } from '@/widgets/video-wall-preview/ui/VideoWallPreview';
import { VideoWallForm } from '@/features/video-wall/ui/VideoWallForm';

export const VideoWallPage = () => {
  const navigate = useNavigate();
  const [layout, setLayout] = useState<'2_h' | '2_v' | '3_h' | '3_v'>('3_v');

  return (
    <Container size="sm" py="xl">
      <Group mb="lg">
        <ActionIcon variant="subtle" onClick={() => navigate(-1)} size="lg">
          <IconArrowLeft size={24} />
        </ActionIcon>
        <Title order={2}>Настройка Медиастены</Title>
      </Group>

      <Text c="dimmed" mb="xl">
        Выберите схему расположения экранов. Верхний экран (или первый в вертикальной схеме) 
        будет показывать часы и QR-код, остальные — видео.
      </Text>

      {/* Превью меняется в зависимости от выбранной схемы */}
      <VideoWallPreview layout={layout} />
      
      <div style={{ marginTop: '2rem' }}>
        <VideoWallForm 
          onSave={(selectedLayout) => {
            console.log('Схема:', selectedLayout);
            navigate(-1);
          }} 
          onCancel={() => navigate(-1)} 
        />
      </div>
    </Container>
  );
};