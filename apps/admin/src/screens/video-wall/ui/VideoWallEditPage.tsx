import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Text, Group, ActionIcon, Loader, Center, Button, Paper, Tabs } from '@mantine/core';
import { IconArrowLeft, IconDeviceTv, IconClock } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { fetchWalls, fetchWallContent } from '@/shared/api/client';
import { useSaveWallContent } from '@/features/video-wall/model/useSaveWallContent';
import { BaseWallContent } from '@/features/video-wall/ui/BaseWallContent';
import { PromoWallContent } from '@/features/video-wall/ui/PromoWallContent';

export const VideoWallEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Загружаем данные стены
  const { data: wallsData, isLoading: isWallsLoading } = useQuery({
    queryKey: ['walls'],
    queryFn: fetchWalls,
  });

  // Загружаем контент стены
  const { data: contentData, isLoading: isContentLoading } = useQuery({
    queryKey: ['wall-content', id],
    queryFn: () => fetchWallContent(id!),
    enabled: !!id,
  });

  const wall = wallsData?.data.find((w: any) => w.id === id);

  const [baseVideos, setBaseVideos] = useState<any[]>([]);
  const [infoData, setInfoData] = useState({ qrUrl: '', text: '' });
  const [promoVideos, setPromoVideos] = useState<any[]>([]);

  const { save, isSaving } = useSaveWallContent(() => {
    // После сохранения можно обновить кеш
  });

  // Заполняем стейты данными из базы
  useEffect(() => {
    if (contentData?.data) {
      const items = contentData.data;
      
      const bases = items.filter((i: any) => i.type === 'BASE');
      const promos = items.filter((i: any) => i.type !== 'BASE');
      
      setBaseVideos(bases.map((b: any) => ({
        id: b.id,
        url: b.url,
        durationSec: b.durationSec,
        orientation: b.orientation,
        dayparts: b.dayparts,
        type: 'BASE'
      })));

      setPromoVideos(promos.map((p: any) => ({
        id: p.id,
        url: p.url,
        durationSec: p.durationSec,
        orientation: p.orientation,
        dayparts: p.dayparts,
        type: p.type,
        qrUrl: p.qrUrl || '',
        infoText: p.infoText || ''
      })));

      if (bases.length > 0) {
        setInfoData({
          qrUrl: bases[0].qrUrl || '',
          text: bases[0].infoText || ''
        });
      }
    }
  }, [contentData]);

  if (isWallsLoading || isContentLoading) return <Center h="100vh"><Loader /></Center>;
  if (!wall) return <Text>Стена не найдена</Text>;

  const isVerticalWall = wall.layoutType.includes('VERTICAL');

  const handleSave = () => {
    save(wall.id, {
      baseContent: { videos: baseVideos },
      infoContent: infoData,
      promoContent: promoVideos,
    });
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