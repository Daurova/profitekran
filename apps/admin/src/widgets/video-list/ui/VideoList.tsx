'use client';

import { Table, Button, Text, Card, Group, ActionIcon, Loader, Center } from '@mantine/core';
import { IconTrash, IconRefresh } from '@tabler/icons-react';
import { useVideoList } from '../model/useVideoList'; // <-- Импорт хука

export const VideoList = () => {
  const { videos, isLoading, loadVideos, handleDelete } = useVideoList();

  if (isLoading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    );
  }

  return (
    <Card withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={500} size="lg">Загруженные видео ({videos.length})</Text>
        <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={loadVideos}>
          Обновить
        </Button>
      </Group>

      {videos.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">Видео пока нет. Загрузите первое видео выше!</Text>
      ) : (
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Тип</Table.Th>
              <Table.Th>Ссылка</Table.Th>
              <Table.Th>Длительность</Table.Th>
              <Table.Th w={80}>Действия</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {videos.map((video) => (
              <Table.Tr key={video.id}>
                <Table.Td>
                  <Text fw={500}>{video.type}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed" lineClamp={1} style={{ maxWidth: 300 }}>
                    {video.url}
                  </Text>
                </Table.Td>
                <Table.Td>{video.durationSec} сек.</Table.Td>
                <Table.Td>
                  <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(video.id)}>
                    <IconTrash size={18} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Card>
  );
};