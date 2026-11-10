import { useState } from 'react';
import { Stack, Group, Button, Input, Text, FileInput, TextInput, Chip, Box, Radio, ActionIcon, Table, Badge } from '@mantine/core';
import { IconUpload, IconQrcode, IconTrash } from '@tabler/icons-react';

const DAYPART_OPTIONS = [
  { value: '09-11', label: 'Утро' },
  { value: '11-14', label: 'День' },
  { value: '14-17', label: 'Обед' },
  { value: '17-20', label: 'Вечер' },
  { value: '20-22', label: 'Ночь' },
];

export const PromoWallContent = ({ isVerticalWall, promoVideos, setPromoVideos }: any) => {
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [tempType, setTempType] = useState('PROMO');
  const [tempQr, setTempQr] = useState('');
  const [tempText, setTempText] = useState('');
  const [tempDayparts, setTempDayparts] = useState<string[]>(['09-11', '11-14', '14-17', '17-20', '20-22']);

  const videoOrientationLabel = isVerticalWall ? 'Вертикальное видео (9:16)' : 'Горизонтальное видео (16:9)';

  const handleAdd = () => {
    if (!tempFile) return;
    setPromoVideos([...promoVideos, { 
      id: Date.now(), 
      file: tempFile, 
      name: tempFile.name,
      type: tempType, 
      qrUrl: tempQr, 
      infoText: tempText,
      dayparts: tempDayparts,
      orientation: isVerticalWall ? 'VERTICAL' : 'HORIZONTAL'
    }]);
    setTempFile(null); setTempType('PROMO'); setTempQr(''); setTempText('');
    setTempDayparts(['09-11', '11-14', '14-17', '17-20', '20-22']);
  };

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">Загрузите рекламу. Для каждого ролика можно указать свой QR-код и текст.</Text>

      <Stack gap="sm" style={{ border: '1px solid #e0e0e0', padding: 16, borderRadius: 8 }}>
        <Radio.Group value={tempType} onChange={setTempType}>
          <Group gap="md">
            <Radio value="PROMO" label="Реклама" />
            <Radio value="ANCHOR" label="Заставка" />
            <Radio value="OFFER" label="Спецпредложение" />
            <Radio value="SERVICE" label="Услуга/Мастер" />
          </Group>
        </Radio.Group>

        <FileInput label={videoOrientationLabel} placeholder="Выберите видеофайл" accept="video/*" leftSection={<IconUpload size={16} />} value={tempFile} onChange={setTempFile} size="md" clearable />
        <TextInput label="Ссылка для QR-кода" placeholder="https://..." value={tempQr} onChange={(e) => setTempQr(e.currentTarget.value)} leftSection={<IconQrcode size={16} />} size="md" />
        <TextInput label="Текст под часами" placeholder="Например: Записаться к мастеру" value={tempText} onChange={(e) => setTempText(e.currentTarget.value)} size="md" />

        <Input.Wrapper label="Время показа">
          <Box mt="xs">
            <Chip.Group multiple value={tempDayparts} onChange={setTempDayparts}>
              <Group gap="xs">
                {DAYPART_OPTIONS.map((option) => (
                  <Chip key={option.value} value={option.value} variant="light" size="md">{option.label}</Chip>
                ))}
              </Group>
            </Chip.Group>
          </Box>
        </Input.Wrapper>

        <Button onClick={handleAdd} disabled={!tempFile} mt="sm">Добавить ролик в список</Button>
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
            {promoVideos.map((v: any) => (
              <Table.Tr key={v.id}>
                <Table.Td><Text size="sm" truncate>{v.name}</Text></Table.Td>
                <Table.Td><Badge size="sm">{v.type}</Badge></Table.Td>
                <Table.Td><Text size="xs" c="dimmed" truncate>{v.qrUrl || '—'}</Text></Table.Td>
                <Table.Td><Text size="xs">{v.dayparts.length === 5 ? 'Всегда' : v.dayparts.join(', ')}</Text></Table.Td>
                <Table.Td>
                  <ActionIcon color="red" variant="subtle" onClick={() => setPromoVideos(promoVideos.filter((p: any) => p.id !== v.id))}>
                    <IconTrash size={18} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
};