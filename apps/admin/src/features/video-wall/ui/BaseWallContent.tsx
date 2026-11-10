import { useState } from 'react';
import { Stack, Group, Button, Input, Text, FileInput, TextInput, Chip, Box, ActionIcon, Divider, Table, Badge } from '@mantine/core';
import { IconUpload, IconQrcode, IconTrash, IconCheck } from '@tabler/icons-react';

const DAYPART_OPTIONS = [
  { value: '09-11', label: 'Утро' },
  { value: '11-14', label: 'День' },
  { value: '14-17', label: 'Обед' },
  { value: '17-20', label: 'Вечер' },
  { value: '20-22', label: 'Ночь' },
];

export const BaseWallContent = ({ 
  isVerticalWall, 
  baseVideos, 
  setBaseVideos, 
  infoData, 
  setInfoData 
}: any) => {
  const [tempBaseFile, setTempBaseFile] = useState<File | null>(null);
  const [tempBaseDayparts, setTempBaseDayparts] = useState<string[]>(['09-11', '11-14', '14-17', '17-20', '20-22']);
  const [isInfoSaved, setIsInfoSaved] = useState(false);

  const videoOrientationLabel = isVerticalWall ? 'Вертикальное видео (9:16)' : 'Горизонтальное видео (16:9)';

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
    setBaseVideos(baseVideos.map((v: any) => v.id === id ? { ...v, dayparts: val } : v));
  };

  return (
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

      {/* Таблица базовых видео */}
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
            {baseVideos.map((v: any) => (
              <Table.Tr key={v.id}>
                <Table.Td><Text size="sm" truncate>{v.name}</Text></Table.Td>
                <Table.Td><Badge size="sm" color="gray">{v.type}</Badge></Table.Td>
                <Table.Td>
                  <Badge size="sm" color={v.orientation === 'HORIZONTAL' ? 'blue' : 'grape'}>
                    {v.orientation === 'HORIZONTAL' ? 'ТВ' : 'Reels'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Chip.Group multiple value={v.dayparts} onChange={(val) => updateBaseVideoDayparts(v.id, val)}>
                    <Group gap="xs">
                      {DAYPART_OPTIONS.map((opt) => (
                        <Chip key={opt.value} value={opt.value} size="xs">{opt.label}</Chip>
                      ))}
                    </Group>
                  </Chip.Group>
                </Table.Td>
                <Table.Td>
                  <ActionIcon color="red" variant="subtle" onClick={() => setBaseVideos(baseVideos.filter((b: any) => b.id !== v.id))}>
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
          value={infoData.qrUrl}
          onChange={(e) => { setInfoData({...infoData, qrUrl: e.currentTarget.value}); setIsInfoSaved(false); }}
          leftSection={<IconQrcode size={16} />}
          size="md"
        />
        <TextInput
          label="Текст под часами"
          placeholder="Например: Записаться в кофейню"
          value={infoData.text}
          onChange={(e) => { setInfoData({...infoData, text: e.currentTarget.value}); setIsInfoSaved(false); }}
          size="md"
        />

        <Group>
          <Button 
            onClick={() => setIsInfoSaved(true)} 
            disabled={isInfoSaved || (!infoData.qrUrl && !infoData.text)}
            leftSection={isInfoSaved ? <IconCheck size={16} /> : undefined}
            color={isInfoSaved ? 'green' : 'blue'}
          >
            {isInfoSaved ? 'Настройки сохранены' : 'Сохранить настройки инфо'}
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
};