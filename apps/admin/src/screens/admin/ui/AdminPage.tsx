'use client';

import { Container, Title, Card, Text } from '@mantine/core';
import { UploadButton } from '@/features/upload-video/ui/UploadButton';

export const AdminPage = () => {
  const handleUploadSuccess = () => {
    alert('Видео успешно загружено и добавлено в базу!');
    // Позже здесь мы будем обновлять список видео
  };

  return (
    <Container size="md" py="xl">
      <Title order={1} mb="lg">Управление видео</Title>
      
      <Card withBorder p="xl">
        <Text fw={500} mb="sm">Загрузить новое видео</Text>
        <Text size="sm" c="dimmed" mb="md">
          Нажмите кнопку ниже, чтобы выбрать файл с устройства
        </Text>
        
        {/* ВОТ ЗДЕСЬ МЫ ВЫЗЫВАЕМ НАШ РЕАЛЬНЫЙ КОМПОНЕНТ */}
        <UploadButton onSuccess={handleUploadSuccess} />
      </Card>
    </Container>
  );
};