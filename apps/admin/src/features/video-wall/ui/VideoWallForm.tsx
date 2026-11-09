import { useState } from 'react';
import { Stack, TextInput, Group, Button, SegmentedControl, Input, Text, Paper } from '@mantine/core';
import { IconClock, IconDeviceTv } from '@tabler/icons-react';

export const VideoWallForm = ({ 
  layout, 
  setLayout, 
  onSave, 
  onCancel 
}: { 
  layout: '2_h' | '2_v' | '3_h' | '3_v', 
  setLayout: (l: any) => void, 
  onSave: () => void, 
  onCancel: () => void 
}) => {
  const [screens, setScreens] = useState<string[]>(['', '', '']); 

  const count = layout.startsWith('2') ? 2 : 3;

  const handleScreenChange = (index: number, value: string) => {
    const newScreens = [...screens];
    newScreens[index] = value;
    setScreens(newScreens);
  };

  return (
    <Stack gap="lg">
      <Input.Wrapper label="Схема расположения">
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

      <Paper withBorder p="md" bg="gray.0">
        <Text size="sm" fw={500} mb="xs">Роли экранов в этой схеме:</Text>
        <Stack gap="xs">
          {Array.from({ length: count }).map((_, i) => {
            // ЖЕСТКОЕ ПРАВИЛО: Если схема на 3 экрана, то 1-й — Инфо, остальные — Видео.
            // Если схема на 2 экрана, то 1-й — Видео, 2-й — Инфо (или по твоему желанию).
            const isInfo = layout.startsWith('3') ? i === 0 : i === 0; 
            // (Для 2-х экранов мы тоже делаем 1-й Инфо, 2-й Видео. Но можно поменять).

            return (
              <TextInput
                key={i}
                label={
                  isInfo 
                    ? `Экран ${i + 1}: Инфо + QR` 
                    : `Экран ${i + 1}: Видео (${i === 1 ? 'верхняя часть' : 'нижняя часть'})`
                }
                placeholder="Введите код с телевизора"
                leftSection={isInfo ? <IconClock size={16} /> : <IconDeviceTv size={16} />}
                value={screens[i]}
                onChange={(e) => handleScreenChange(i, e.currentTarget.value)}
                size="md"
              />
            );
          })}
        </Stack>
      </Paper>

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onCancel}>Отмена</Button>
        <Button onClick={onSave}>Собрать стену</Button>
      </Group>
    </Stack>
  );
};