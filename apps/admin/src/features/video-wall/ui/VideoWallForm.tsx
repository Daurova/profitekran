import { useState } from 'react';
import { Stack, TextInput, Group, Button, SegmentedControl, Input} from '@mantine/core';
import { IconClock, IconDeviceTv} from '@tabler/icons-react';

export const VideoWallForm = ({ onSave, onCancel }: { onSave: (layout: string) => void, onCancel: () => void }) => {
  const [layout, setLayout] = useState<'2_h' | '2_v' | '3_h' | '3_v'>('3_v');
  const [screens, setScreens] = useState<string[]>(['', '', '']); // 3 поля максимум

  const count = layout.startsWith('2') ? 2 : 3;
  // const isHorizontal = layout.endsWith('_h');

  const handleScreenChange = (index: number, value: string) => {
    const newScreens = [...screens];
    newScreens[index] = value;
    setScreens(newScreens);
  };

  return (
    <Stack gap="lg">
      {/* ВЫБОР СХЕМЫ */}
      <Input.Wrapper label="Схема расположения">
        <SegmentedControl
          fullWidth
          mt="xs"
          value={layout}
          onChange={(val) => setLayout(val as any)}
          data={[
            { label: '2 Гориз.', value: '2_h' },
            { label: '2 Верт.', value: '2_v' },
            { label: '3 Гориз.', value: '3_h' },
            { label: '3 Верт.', value: '3_v' },
          ]}
        />
      </Input.Wrapper>

      {/* ДИНАМИЧЕСКИЕ ПОЛЯ ДЛЯ КОДОВ */}
      <Stack gap="md">
        {Array.from({ length: count }).map((_, i) => {
          const isInfo = (layout === '2_v' && i === 0) || (layout === '3_v' && i === 0);
          
          return (
            <TextInput
              key={i}
              label={
                isInfo 
                  ? `Код экрана ${i + 1} (Инфо + QR)` 
                  : `Код экрана ${i + 1} (Видео)`
              }
              placeholder="Например: A1B2C3"
              leftSection={isInfo ? <IconClock size={16} /> : <IconDeviceTv size={16} />}
              value={screens[i]}
              onChange={(e) => handleScreenChange(i, e.currentTarget.value)}
              size="md"
            />
          );
        })}
      </Stack>

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onCancel}>Отмена</Button>
        <Button onClick={() => onSave(layout)}>Собрать стену</Button>
      </Group>
    </Stack>
  );
};