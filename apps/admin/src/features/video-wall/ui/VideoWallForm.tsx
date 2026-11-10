import { useState } from 'react';
import { Stack, Group, Button, SegmentedControl, Input, Text, Paper, Tabs } from '@mantine/core';
import { IconDeviceTv, IconClock } from '@tabler/icons-react';
import { VideoWallPreview } from '@/widgets/video-wall-preview/ui/VideoWallPreview';
import { BaseWallContent } from './BaseWallContent';
import { PromoWallContent } from './PromoWallContent';

export const VideoWallForm = ({ 
  layout, 
  setLayout, 
  onSave, 
  onCancel 
}: { 
  layout: string, 
  setLayout: (l: any) => void, 
  onSave: (data: any) => void, 
  onCancel: () => void 
}) => {
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [baseVideos, setBaseVideos] = useState<any[]>([]);
  const [infoData, setInfoData] = useState({ qrUrl: '', text: '' });
  const [promoVideos, setPromoVideos] = useState<any[]>([]);

  const isVerticalWall = layout.endsWith('_v');

  const handleSave = () => {
       onSave({
      layoutType: layout, // <-- переименовали
      screens: codes,     // <-- переименовали
      baseContent: { videos: baseVideos },
      infoContent: infoData,
      promoContent: promoVideos,
    });
  };

  const isScreensReady = Object.keys(codes).length === (layout.startsWith('2') ? 2 : 3);
  const isBaseContentReady = baseVideos.length > 0;

  return (
    <Stack gap="xl">
      <Input.Wrapper label="1. Схема расположения">
        <SegmentedControl
          fullWidth mt="xs" value={layout} onChange={setLayout}
          data={[
            { label: '2 Гориз.', value: '2_h' },
            { label: '2 Верт.', value: '2_v' },
            { label: '3 Гориз.', value: '3_h' },
            { label: '3 Верт.', value: '3_v' },
          ]}
        />
      </Input.Wrapper>

      <VideoWallPreview layout={layout} codes={codes} onCodeChange={(role, code) => setCodes({ ...codes, [role]: code })} />

      <Paper withBorder p="md" bg="blue.0">
        <Text fw={500} mb="md">2. Контент для этой стены</Text>
        
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

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onCancel}>Отмена</Button>
        <Button onClick={handleSave} disabled={!isScreensReady || !isBaseContentReady}>
          Собрать стену
        </Button>
      </Group>
    </Stack>
  );
};