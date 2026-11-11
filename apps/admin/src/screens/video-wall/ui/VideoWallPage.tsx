import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Group, ActionIcon, Card, SimpleGrid, Badge, Loader, Center, Divider, Button, TextInput, SegmentedControl } from '@mantine/core';
import { IconArrowLeft, IconDeviceTv, IconPlus } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { fetchWalls, createWallFrame } from '@/shared/api/client';
import { getLayoutRoles } from '@/shared/config/wall-layouts'; // <-- ИМПОРТ

export const VideoWallPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [layout, setLayout] = useState('2_h');

  const { data, isLoading } = useQuery({
    queryKey: ['walls'],
    queryFn: fetchWalls,
  });

  const walls = data?.data || [];
  const roles = getLayoutRoles(layout);

  const handleCreateFrame = async () => {
    try {
      const res = await createWallFrame({ layout, screens: codes });
      notifications.show({ title: 'Успех', message: 'Каркас создан', color: 'green' });
      queryClient.invalidateQueries({ queryKey: ['walls'] });
      setIsCreating(false);
      setCodes({});
      navigate(`/wall/${res.wall.id}`);
    } catch (err) {
      notifications.show({ title: 'Ошибка', message: 'Не удалось создать каркас', color: 'red' });
    }
  };

  return (
    <Container size="md" py="xl">
      <Group mb="lg">
        <ActionIcon variant="subtle" onClick={() => navigate(-1)} size="lg">
          <IconArrowLeft size={24} />
        </ActionIcon>
        <Title order={2}>Медиастены</Title>
        <Button 
          ml="auto" 
          leftSection={<IconPlus size={16} />} 
          onClick={() => setIsCreating(!isCreating)}
          variant={isCreating ? 'default' : 'filled'}
        >
          {isCreating ? 'Отмена' : 'Создать каркас'}
        </Button>
      </Group>

      {isCreating && (
        <Card withBorder mb="xl" bg="blue.0">
          <Text fw={500} mb="md">Создание нового каркаса</Text>
          
          <Text size="sm" fw={500} mb="xs">Схема:</Text>
          <SegmentedControl
            fullWidth
            mb="md"
            value={layout}
            onChange={setLayout}
            data={[
              { label: '2 Гориз.', value: '2_h' },
              { label: '2 Верт.', value: '2_v' },
              { label: '3 Гориз.', value: '3_h' },
              { label: '3 Верт.', value: '3_v' },
            ]}
          />

          <Text size="sm" fw={500} mb="xs">Коды экранов:</Text>
          <Group mb="md">
            {roles.map((r) => (
              <TextInput
                key={r.role}
                placeholder={r.label}
                value={codes[r.role] || ''}
                onChange={(e) => setCodes({ ...codes, [r.role]: e.target.value.toUpperCase() })}
              />
            ))}
          </Group>

          <Button onClick={handleCreateFrame}>Создать и перейти к наполнению</Button>
        </Card>
      )}

      <Divider my="xl" label="Мои стены" labelPosition="center" />

      {isLoading ? (
        <Center h={100}><Loader /></Center>
      ) : walls.length === 0 ? (
        <Text c="dimmed" ta="center" py="md">У вас пока нет стен.</Text>
      ) : (
        <SimpleGrid cols={2} spacing="md">
          {walls.map((wall: any) => (
            <Card key={wall.id} withBorder p="md" style={{ cursor: 'pointer' }} onClick={() => navigate(`/wall/${wall.id}`)}>
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <IconDeviceTv size={20} />
                  <Text fw={500}>{wall.name}</Text>
                </Group>
                <Badge color="blue">{wall.layoutType}</Badge>
              </Group>
              <Text size="sm" c="dimmed">Экранов: {wall.screens?.length || 0}</Text>
              <Text size="sm" c="dimmed">Контента: {wall.items?.length || 0}</Text>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};