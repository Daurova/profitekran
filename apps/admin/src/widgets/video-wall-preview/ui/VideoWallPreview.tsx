import { useState } from 'react';
import { 
  Paper, Stack, Text, SimpleGrid, Button, Group, 
  TextInput, ActionIcon 
} from '@mantine/core';
import { IconClock, IconQrcode, IconDeviceTv, IconPlus, IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const LAYOUT_ROLES: Record<string, { label: string; role: string; isInfo: boolean; height: number }[]> = {
  '2_h': [
    { label: 'Экран 1: Видео', role: 'VIDEO_FULL', isInfo: false, height: 120 },
    { label: 'Экран 2: Инфо', role: 'INFO', isInfo: true, height: 120 },
  ],
  '2_v': [
    { label: 'Экран 1: Видео', role: 'VIDEO_FULL', isInfo: false, height: 120 },
    { label: 'Экран 2: Инфо', role: 'INFO', isInfo: true, height: 80 },
  ],
  '3_h': [
    { label: 'Экран 1: Видео (лево)', role: 'VIDEO_LEFT', isInfo: false, height: 120 },
    { label: 'Экран 2: Видео (право)', role: 'VIDEO_RIGHT', isInfo: false, height: 120 },
    { label: 'Экран 3: Инфо', role: 'INFO', isInfo: true, height: 120 },
  ],
  '3_v': [
    { label: 'Экран 1: Видео (верх)', role: 'VIDEO_TOP', isInfo: false, height: 100 },
    { label: 'Экран 2: Видео (низ)', role: 'VIDEO_BOTTOM', isInfo: false, height: 100 },
    { label: 'Экран 3: Инфо', role: 'INFO', isInfo: true, height: 60 },
  ],
};

interface VideoWallPreviewProps {
  layout: string;
  codes: Record<string, string>;
  onCodeChange: (role: string, code: string) => void;
}

export const VideoWallPreview = ({ layout, codes, onCodeChange }: VideoWallPreviewProps) => {
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [tempCode, setTempCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const roles = LAYOUT_ROLES[layout] || LAYOUT_ROLES['3_v'];

  const handleStartEdit = (role: string) => {
    setEditingRole(role);
    setTempCode(codes[role] || '');
  };

  const handleSave = async () => {
    if (!editingRole || !tempCode) return;
    setIsChecking(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://profitekran.online/api';
      const res = await fetch(`${API_URL}/walls/verify-screen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: tempCode.toUpperCase() }),
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка проверки');
      }

      onCodeChange(editingRole, tempCode.toUpperCase());
      setEditingRole(null);
      notifications.show({ title: 'Успех', message: 'Экран свободен и привязан', color: 'green' });
    } catch (err) {
      notifications.show({
        title: 'Ошибка',
        message: err instanceof Error ? err.message : 'Не удалось привязать экран',
        color: 'red',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleCancel = () => {
    setEditingRole(null);
  };

  const ScreenBox = ({ label, role, isInfo, height }: any) => {
    const savedCode = codes[role];
    const isEditing = editingRole === role;

    return (
      <Paper 
        withBorder 
        p="xs" 
        bg={isInfo ? "blue.1" : "gray.1"} 
        style={{ 
          height, borderRadius: 8, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', 
          borderStyle: savedCode ? 'solid' : 'dashed', borderWidth: 2,
          position: 'relative'
        }}
      >
        <Group gap="xs" mb="xs">
          {isInfo ? <IconClock size={20} /> : <IconDeviceTv size={20} />}
          <Text fw={500} size="sm" ta="center">{label}</Text>
          {isInfo && <IconQrcode size={20} />}
        </Group>

        {isEditing ? (
          <Group gap="xs" wrap="nowrap">
            <TextInput
              size="xs"
              placeholder="Код"
              value={tempCode}
              onChange={(e) => setTempCode(e.currentTarget.value.toUpperCase())}
              autoFocus
              style={{ width: 100 }}
              disabled={isChecking}
            />
            <ActionIcon color="green" variant="subtle" onClick={handleSave} loading={isChecking}>
              <IconCheck size={18} />
            </ActionIcon>
            <ActionIcon color="red" variant="subtle" onClick={handleCancel} disabled={isChecking}>
              <IconX size={18} />
            </ActionIcon>
          </Group>
        ) : savedCode ? (
          <Group gap="xs">
            <IconCheck size={16} color="green" />
            <Text fw={700} size="md" c="green" style={{ cursor: 'pointer' }} onClick={() => handleStartEdit(role)}>
              {savedCode}
            </Text>
          </Group>
        ) : (
          <Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={() => handleStartEdit(role)}>
            Ввести код
          </Button>
        )}
      </Paper>
    );
  };

  return (
    <Paper withBorder p="md" bg="gray.0">
      <Text size="sm" fw={500} mb="md">Кликните на экран, чтобы ввести код с телевизора:</Text>
      
      {layout === '2_h' && (
        <SimpleGrid cols={2} spacing="xs">
          {roles.map(r => <ScreenBox key={r.role} {...r} />)}
        </SimpleGrid>
      )}
      {layout === '2_v' && (
        <Stack gap="xs">
          {roles.map(r => <ScreenBox key={r.role} {...r} />)}
        </Stack>
      )}
      {layout === '3_h' && (
        <SimpleGrid cols={3} spacing="xs">
          {roles.map(r => <ScreenBox key={r.role} {...r} />)}
        </SimpleGrid>
      )}
      {layout === '3_v' && (
        <Stack gap="xs">
          {roles.map(r => <ScreenBox key={r.role} {...r} />)}
        </Stack>
      )}
    </Paper>
  );
};