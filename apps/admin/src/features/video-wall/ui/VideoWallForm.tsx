import { useState } from 'react';
import { 
  Stack, Group, Button, SegmentedControl, Input, Text, Paper, 
  FileInput, TextInput, Chip, Box, Tabs, Radio, ActionIcon, Divider, Table, Badge 
} from '@mantine/core';
import { IconUpload, IconQrcode, IconDeviceTv, IconClock, IconTrash, IconCheck } from '@tabler/icons-react';
import { VideoWallPreview } from '@/widgets/video-wall-preview/ui/VideoWallPreview';

const DAYPART_OPTIONS = [
  { value: '09-11', label: 'Утро' },
  { value: '11-14', label: 'День' },
  { value: '14-17', label: 'Обед' },
  { value: '17-20', label: 'Вечер' },
  { value: '20-22', label: 'Ночь' },
];

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
  
  // --- БАЗОВЫЕ ВИДЕО ---
  const [baseVideos, setBaseVideos] = useState<any[]>([]);
  const [tempBaseFile, setTempBaseFile] = useState<File | null>(null);
  const [tempBaseDayparts, setTempBaseDayparts] = useState<string[]>(['09-11', '11-14', '14-17', '17-20', '20-22']);

  // --- ИНФО-ЭКРАН ---
  const [infoQrUrl, setInfoQrUrl] = useState('');
  const [infoText, setInfoText] = useState('');
  const [isInfoSaved, setIsInfoSaved] = useState(false);

  // --- РЕКЛАМНЫЕ ВИДЕО ---
  const [promoVideos, setPromoVideos] = useState<any[]>([]);
  const [tempPromoFile, setTempPromoFile] = useState<File | null>(null);
  const [tempPromoType, setTempPromoType] = useState('PROMO');
  const [tempPromoQr, setTempPromoQr] = useState('');
  const [tempPromoText, setTempPromoText] = useState('');
  const [tempPromoDayparts, setTempPromoDayparts] = useState<string[]>(['09-11', '11-14', '14-17', '17-20', '20-22']);

  const handleCodeChange = (role: string, code: string) => {
    setCodes(prev => ({ ...prev, [role]: code }));
  };

  const isVerticalWall = layout.endsWith('_v');
  const videoOrientationLabel = isVerticalWall ? 'Вертикальное видео (9:16)' : 'Горизонтальное видео (16:9)';

  // --- БАЗОВЫЕ ВИДЕО ---
  const handleAddBaseVideo = () => {
    if (!tempBaseFile) return;
    setBaseVideos([...baseVideos, { 
      id: Date.now(), 
      file: tempBaseFile, 
      name: tempBaseFile.name,
      dayparts: tempBaseDayparts,
      type: 'BASE',
      orientation: isVerticalWall ? 'VERTICAL' : 'HORIZONTAL'
    }]);
    setTempBaseFile(null);
    setTempBaseDayparts(['09-11', '11-14', '14-17', '17-20', '20-22']); 
  };

  const updateBaseVideoDayparts = (id: number, val: string[]) => {
    setBaseVideos(baseVideos.map(v => v.id === id ? { ...v, dayparts: val } : v));
  };

  // --- ИНФО ---
  const handleSaveInfo = () => setIsInfoSaved(true);
  const handleInfoChange = () => setIsInfoSaved(false);

  // --- РЕКЛАМА ---
  const handleAddPromoVideo = () => {
    if (!tempPromoFile) return;
    setPromoVideos([...promoVideos, { 
      id: Date.now(), 
      file: tempPromoFile, 
      name: tempPromoFile.name,
      type: tempPromoType, 
      qrUrl: tempPromoQr, 
      infoText: tempPromoText,
      dayparts: tempPromoDayparts,
      orientation: isVerticalWall ? 'VERTICAL' : 'HORIZONTAL'
    }]);
    setTempPromoFile(null);
    setTempPromoType('PROMO');
    setTempPromoQr('');
    setTempPromoText('');
    setTempPromoDayparts(['09-11', '11-14', '14-17', '17-20', '20-22']);
  };

  const handleSave = () => {
    onSave({
      layout,
      codes,
      baseContent: { videos: baseVideos },
      infoContent: { qrUrl: infoQrUrl, text: infoText },
      promoContent: promoVideos,
    });
  };

  const isScreensReady = Object.keys(codes).length === (layout.startsWith('2') ? 2 : 3);
  const isBaseContentReady = baseVideos.length > 0;

  return (
    <Stack gap="xl">
      {/* 1. СБОРКА ЭКРАНОВ */}
      <Stack gap="lg">
        <Input.Wrapper label="1. Схема расположения">
          <SegmentedControl
            fullWidth
            mt="xs"
            value={layout}
            onChange={setLayout}
            data={[
              { label: '2 Гориз.', value: '2_h' },
              { label: '2 Верт.', value: '2_v' },
              { label: '3 Гориз.', value: '3_h' },
              { label: '3 Верт.', value: '3_v' },
            ]}
          />
        </Input.Wrapper>

        <VideoWallPreview 
          layout={layout} 
          codes={codes} 
          onCodeChange={handleCodeChange} 
        />
      </Stack>

      {/* 2. КОНТЕНТ ДЛЯ СТЕНЫ */}
      <Paper withBorder p="md" bg="blue.0">
        <Text fw={500} mb="md">2. Контент для этой стены</Text>
        
        <Tabs defaultValue="base" variant="pills" mb="md">
          <Tabs.List>
            <Tabs.Tab value="base" leftSection={<IconDeviceTv size={16} />}>Основной эфир</Tabs.Tab>
            <Tabs.Tab value="promo" leftSection={<IconClock size={16} />}>Реклама (с QR)</Tabs.Tab>
          </Tabs.List>

          {/* ВКЛАДКА 1: ОСНОВНОЙ ЭФИР */}
          <Tabs.Panel value="base" pt="md">
            <Stack gap="xl">
              <Stack gap="md">
                <Text size="sm" c="dimmed">Загрузите фоновые видео и выберите для каждого свое время показа.</Text>
                
                <FileInput
                  label={videoOrientationLabel}
                  placeholder="Выберите видео для загрузки"
                  accept="video/*"
                  leftSection={<IconUpload size={16} />}
                  value={tempBaseFile}
                  onChange={setTempBaseFile}
                  size="md"
                  clearable
                />

                <Input.Wrapper label="Время показа">
                  <Box mt="xs">
                    <Chip.Group multiple value={tempBaseDayparts} onChange={setTempBaseDayparts}>
                      <Group gap="xs">
                        {DAYPART_OPTIONS.map((option) => (
                          <Chip key={option.value} value={option.value} variant="light" size="md">
                            {option.label}
                          </Chip>
                        ))}
                      </Group>
                    </Chip.Group>
                  </Box>
                </Input.Wrapper>

                <Button onClick={handleAddBaseVideo} disabled={!tempBaseFile} size="md">
                  Загрузить видео в список
                </Button>
              </Stack>

              {baseVideos.length > 0 && (
                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Файл</Table.Th>
                      <Table.Th>Тип</Table.Th>
                      <Table.Th>Формат</Table.Th>
                      <Table.Th>Время показа</Table.Th>
                      <Table.Th w={60}>Удал.</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {baseVideos.map((v) => (
                      <Table.Tr key={v.id}>
                        <Table.Td><Text size="sm" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</Text></Table.Td>
<Table.Td>
  <Badge size="sm" color="gray" variant="filled">
    {v.type ? v.type : 'НЕТ ТИПА'}
  </Badge>
</Table.Td>                        <Table.Td>
                          <Badge size="sm" color={v.orientation === 'HORIZONTAL' ? 'blue' : 'grape'}>
                            {v.orientation === 'HORIZONTAL' ? 'ТВ' : 'Reels'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Chip.Group multiple value={v.dayparts} onChange={(val) => updateBaseVideoDayparts(v.id, val)}>
                            <Group gap="xs">
                              {DAYPART_OPTIONS.map((opt) => (
                                <Chip key={opt.value} value={opt.value} size="xs">
                                  {opt.label}
                                </Chip>
                              ))}
                            </Group>
                          </Chip.Group>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon color="red" variant="subtle" onClick={() => setBaseVideos(baseVideos.filter(b => b.id !== v.id))}>
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}

              <Divider my="sm" label="Настройки инфо-экрана" labelPosition="center" />

              <Stack gap="md">
                <Text size="sm" c="dimmed">Настройте часы, текст и QR-код для инфо-экрана.</Text>

                <TextInput
                  label="Ссылка для QR-кода"
                  placeholder="https://..."
                  value={infoQrUrl}
                  onChange={(e) => { setInfoQrUrl(e.currentTarget.value); handleInfoChange(); }}
                  leftSection={<IconQrcode size={16} />}
                  size="md"
                />
                <TextInput
                  label="Текст под часами"
                  placeholder="Например: Записаться в кофейню"
                  value={infoText}
                  onChange={(e) => { setInfoText(e.currentTarget.value); handleInfoChange(); }}
                  size="md"
                />

                <Group>
                  <Button 
                    onClick={handleSaveInfo} 
                    disabled={isInfoSaved || (!infoQrUrl && !infoText)}
                    leftSection={isInfoSaved ? <IconCheck size={16} /> : undefined}
                    color={isInfoSaved ? 'green' : 'blue'}
                  >
                    {isInfoSaved ? 'Настройки сохранены' : 'Сохранить настройки инфо'}
                  </Button>
                </Group>
              </Stack>
            </Stack>
          </Tabs.Panel>

          {/* ВКЛАДКА 2: РЕКЛАМА */}
          <Tabs.Panel value="promo" pt="md">
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Загрузите рекламу. Для каждого ролика можно указать свой QR-код и текст.
              </Text>

              <Stack gap="sm" style={{ border: '1px solid #e0e0e0', padding: 16, borderRadius: 8 }}>
                <Radio.Group value={tempPromoType} onChange={setTempPromoType}>
                  <Group gap="md">
                    <Radio value="PROMO" label="Реклама" />
                    <Radio value="ANCHOR" label="Заставка" />
                    <Radio value="OFFER" label="Спецпредложение" />
                    <Radio value="SERVICE" label="Услуга/Мастер" />
                  </Group>
                </Radio.Group>

                <FileInput
                  label={videoOrientationLabel}
                  placeholder="Выберите видеофайл"
                  accept="video/*"
                  leftSection={<IconUpload size={16} />}
                  value={tempPromoFile}
                  onChange={setTempPromoFile}
                  size="md"
                  clearable
                />

                <TextInput
                  label="Ссылка для QR-кода"
                  placeholder="https://..."
                  value={tempPromoQr}
                  onChange={(e) => setTempPromoQr(e.currentTarget.value)}
                  leftSection={<IconQrcode size={16} />}
                  size="md"
                />
                
                <TextInput
                  label="Текст под часами"
                  placeholder="Например: Записаться к мастеру"
                  value={tempPromoText}
                  onChange={(e) => setTempPromoText(e.currentTarget.value)}
                  size="md"
                />

                <Input.Wrapper label="Время показа">
                  <Box mt="xs">
                    <Chip.Group multiple value={tempPromoDayparts} onChange={setTempPromoDayparts}>
                      <Group gap="xs">
                        {DAYPART_OPTIONS.map((option) => (
                          <Chip key={option.value} value={option.value} variant="light" size="md">
                            {option.label}
                          </Chip>
                        ))}
                      </Group>
                    </Chip.Group>
                  </Box>
                </Input.Wrapper>

                <Button onClick={handleAddPromoVideo} disabled={!tempPromoFile} mt="sm">
                  Добавить ролик в список
                </Button>
              </Stack>

              {promoVideos.length > 0 && (
                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Файл</Table.Th>
                      <Table.Th>Тип</Table.Th>
                      <Table.Th>QR-код</Table.Th>
                      <Table.Th>Время</Table.Th>
                      <Table.Th w={60}>Удал.</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {promoVideos.map((v) => (
                      <Table.Tr key={v.id}>
                        <Table.Td><Text size="sm" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</Text></Table.Td>
                        <Table.Td><Badge size="sm">{v.type}</Badge></Table.Td>
                        <Table.Td><Text size="xs" c="dimmed" style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.qrUrl || '—'}</Text></Table.Td>
                        <Table.Td><Text size="xs">{v.dayparts.length === 5 ? 'Всегда' : v.dayparts.join(', ')}</Text></Table.Td>
                        <Table.Td>
                          <ActionIcon color="red" variant="subtle" onClick={() => setPromoVideos(promoVideos.filter(p => p.id !== v.id))}>
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onCancel}>Отмена</Button>
        <Button 
          onClick={handleSave} 
          disabled={!isScreensReady || !isBaseContentReady}
        >
          Собрать стену
        </Button>
      </Group>
    </Stack>
  );
};