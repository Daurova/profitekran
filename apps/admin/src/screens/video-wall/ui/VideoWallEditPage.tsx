import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Text, Group, ActionIcon, Loader, Center, Button, Paper, Tabs } from '@mantine/core';
import { IconArrowLeft, IconDeviceTv, IconClock } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { fetchWalls, saveWallContent } from '@/shared/api/client';
import { BaseWallContent } from '@/features/video-wall/ui/BaseWallContent';
import { PromoWallContent } from '@/features/video-wall/ui/PromoWallContent';

export const VideoWallEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Получаем данные стены
  const { data, isLoading } = useQuery({
    queryKey: ['walls'],
    queryFn: fetchWalls,
  });

  const wall = data?.data.find((w: any) => w.id === id);

  // Состояния для контента
  const [baseVideos, setBaseVideos] = useState<any[]>([]);
  const [infoData, setInfoData] = useState({ qrUrl: '', text: '' });
  const [promoVideos, setPromoVideos] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) return <Center h="100vh"><Loader /></Center>;
  if (!wall) return <Text>Стена не найдена</Text>;

  const isVerticalWall = wall.layoutType.includes('VERTICAL');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveWallContent(wall.id, {
        baseContent: { videos: baseVideos },
        infoContent: infoData,
        promoContent: promoVideos,
      });
      notifications.show({ title: 'Успех', message: 'Контент сохранен', color: 'green' });
    } catch (err) {
      notifications.show({ title: 'Ошибка', message: 'Не удалось сохранить контент', color: 'red' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Group mb="lg">
        <ActionIcon variant="subtle" onClick={() => navigate('/wall')} size="lg">
          <IconArrowLeft size={24} />
        </ActionIcon>
        <Title order={2}>Наполнение стены</Title>
      </Group>

      <Text c="dimmed" mb="xl">Схема: {wall.layoutType}</Text>

      <Paper withBorder p="md" bg="blue.0">
        <Tabs defaultValue="base" variant="pills" mb="md">
          <Tabs.List>
            <Tabs.Tab value="base" leftSection={<IconDeviceTv size={16} />}>Основной эфир</Tabs.Tab>
            <Tabs.Tab value="promo" leftSection={<IconClock size={16} />}>Реклама (с QR)</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="base" pt="md">
            <BaseWallContent 
              isVerticalWall={isVerticalWall}
              baseVideos={baseVideos}
              setBaseVideos={setBaseVideos}
              infoData={infoData}
              setInfoData={setInfoData}
            />
          </Tabs.Panel>

          <Tabs.Panel value="promo" pt="md">
            <PromoWallContent 
              isVerticalWall={isVerticalWall}
              promoVideos={promoVideos}
              setPromoVideos={setPromoVideos}
            />
          </Tabs.Panel>
        </Tabs>
      </Paper>

      <Group justify="flex-end" mt="xl">
        <Button onClick={handleSave} loading={isSaving} size="lg">
          Сохранить контент
        </Button>
      </Group>
    </Container>
  );
};