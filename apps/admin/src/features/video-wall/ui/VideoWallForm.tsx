import { useState } from 'react';
import { Stack, TextInput, Group, Button } from '@mantine/core';
import { IconClock, IconDeviceTv } from '@tabler/icons-react';

export const VideoWallForm = ({ onSave, onCancel }: { onSave: () => void, onCancel: () => void }) => {
  const [topScreen, setTopScreen] = useState('');
  const [middleScreen, setMiddleScreen] = useState('');
  const [bottomScreen, setBottomScreen] = useState('');

  return (
    <Stack gap="md">
      <TextInput
        label="Код верхнего экрана (Инфо)"
        placeholder="Например: A1B2C3"
        leftSection={<IconClock size={16} />}
        value={topScreen}
        onChange={(e) => setTopScreen(e.currentTarget.value)}
        size="md"
      />
      <TextInput
        label="Код среднего экрана (Видео)"
        placeholder="Например: D4E5F6"
        leftSection={<IconDeviceTv size={16} />}
        value={middleScreen}
        onChange={(e) => setMiddleScreen(e.currentTarget.value)}
        size="md"
      />
      <TextInput
        label="Код нижнего экрана (Видео)"
        placeholder="Например: G7H8I9"
        leftSection={<IconDeviceTv size={16} />}
        value={bottomScreen}
        onChange={(e) => setBottomScreen(e.currentTarget.value)}
        size="md"
      />
      
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onCancel}>Отмена</Button>
        <Button onClick={onSave}>Собрать стену</Button>
      </Group>
    </Stack>
  );
};