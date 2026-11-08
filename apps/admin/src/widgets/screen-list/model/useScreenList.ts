import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchScreens, deleteScreenById } from '@/shared/api/client';
import { notifications } from '@mantine/notifications';

export const useScreenList = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['screens'],
    queryFn: fetchScreens,
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот экран? Телевизор потребует повторную активацию.')) return;
    
    try {
      await deleteScreenById(id);
      notifications.show({ title: 'Успех', message: 'Экран удален', color: 'green' });
      queryClient.invalidateQueries({ queryKey: ['screens'] });
    } catch (err) {
      notifications.show({ title: 'Ошибка', message: 'Не удалось удалить экран', color: 'red' });
    }
  };

  return {
    screens: data?.data || [],
    isLoading,
    refetch,
    handleDelete, // <-- Возвращаем функцию удаления
  };
};