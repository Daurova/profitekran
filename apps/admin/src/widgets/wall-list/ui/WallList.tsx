import { Card, Table, Text, Badge, Group, Loader, Center, ActionIcon } from '@mantine/core';
import { IconDeviceTv } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { fetchWalls } from '@/shared/api/client';

export const WallList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['walls'],
    queryFn: fetchWalls,
  });

  if (isLoading) return <Center h={100}><Loader /></Center>;

  const walls = data?.data || [];

  if (walls.length === 0) {
    return <Text c="dimmed" ta="center" py="md">У вас пока нет созданных стен.</Text>;
  }

  return (
    <Card withBorder>
      <Text fw={500} size="lg" mb="md">Мои медиастены ({walls.length})</Text>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Название</Table.Th>
            <Table.Th>Схема</Table.Th>
            <Table.Th>Экранов</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {walls.map((wall: any) => (
            <Table.Tr key={wall.id}>
              <Table.Td>
                <Group gap="xs">
                  <IconDeviceTv size={18} />
                  <Text fw={500}>{wall.name}</Text>
                </Group>
              </Table.Td>
              <Table.Td><Badge color="blue">{wall.layoutType}</Badge></Table.Td>
              <Table.Td><Text size="sm">{wall.screens.length} шт.</Text></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
};