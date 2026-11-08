import { Card, Table, Text, Badge, Group, Loader, Center, Button } from '@mantine/core';
import { IconRefresh, IconDeviceTv } from '@tabler/icons-react';
import { useScreenList } from '../model/useScreenList';

export const ScreenList = () => {
  const { screens, isLoading, refetch } = useScreenList();

  if (isLoading) return <Center h={100}><Loader /></Center>;

  return (
    <Card withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={500} size="lg">Мои экраны ({screens.length})</Text>
        <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={() => refetch()}>
          Обновить
        </Button>
      </Group>

      {screens.length === 0 ? (
        <Text c="dimmed" ta="center" py="md">У вас пока нет привязанных экранов.</Text>
      ) : (
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Название</Table.Th>
              <Table.Th>Код устройства</Table.Th>
              <Table.Th>Статус</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {screens.map((screen) => (
              <Table.Tr key={screen.id}>
                <Table.Td>
                  <Group gap="xs">
                    <IconDeviceTv size={18} />
                    <Text fw={500}>{screen.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge color="gray" variant="outline" size="lg">{screen.deviceId}</Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={screen.isActive ? 'green' : 'red'}>
                    {screen.isActive ? 'Активен' : 'Отключен'}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Card>
  );
};