import { useState } from 'react';
import { TextInput, Button, Card, Alert, Title, Text, Stack } from '@mantine/core';
import { IconAlertCircle, IconDeviceTv } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { addScreen } from '@/shared/api/client';
import { useQueryClient } from '@tanstack/react-query';

export const BindScreenForm = () => {
  const [deviceId, setDeviceId] = useState('');
  const [screenName, setScreenName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleAddScreen = async () => {
    if (!deviceId || !screenName) return;
    setIsAdding(true);
    setError(null);

    try {
      await addScreen(deviceId.toUpperCase(), screenName);
      notifications.show({
        title: 'Успех',
        message: 'Экран привязан к вашему аккаунту',
        color: 'green',
      });
      setDeviceId('');
      setScreenName('');
      queryClient.invalidateQueries({ queryKey: ['screens'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка привязки экрана');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card withBorder p="xl">
      <Title order={3} mb="md">Привязка телевизора</Title>
      <Text size="sm" c="dimmed" mb="lg">
        Включите телевизор, найдите на экране код активации и введите его сюда.
      </Text>
      
      <Stack gap="md">
        <TextInput
          label="Код устройства (с телевизора)"
          placeholder="Например: X7Y9Z2"
          value={deviceId}
          onChange={(e) => setDeviceId(e.currentTarget.value)}
          size="lg"
          leftSection={<IconDeviceTv size={16} />}
        />
        <TextInput
          label="Название экрана"
          placeholder="Например: Экран в зале"
          value={screenName}
          onChange={(e) => setScreenName(e.currentTarget.value)}
          size="lg"
        />
        <Button 
          size="lg" 
          onClick={handleAddScreen} 
          loading={isAdding}
          disabled={!deviceId || !screenName}
        >
          Привязать экран
        </Button>
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {error}
          </Alert>
        )}
      </Stack>
    </Card>
  );
};