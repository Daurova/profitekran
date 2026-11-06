import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchVideos, deleteVideoById, type VideoFromDb } from '@/shared/api/client';
import { notifications } from '@mantine/notifications';

export const useVideoList = () => {
  const queryClient = useQueryClient();

  // 1. Загрузка списка (React Query сам следит за кэшем)
  const { data, isLoading, refetch } = useQuery<{ data: VideoFromDb[] }>({
    queryKey: ['videos'],
    queryFn: fetchVideos,
  });

  // 2. Мутация для удаления
  const deleteMutation = useMutation({
    mutationFn: deleteVideoById,
    onSuccess: () => {
      notifications.show({ title: 'Удалено', message: 'Видео удалено', color: 'green' });
      // Говорим React Query перезагрузить список
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: () => {
      notifications.show({ title: 'Ошибка', message: 'Не удалось удалить', color: 'red' });
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это видео?')) return;
    deleteMutation.mutate(id);
  };

  return {
    videos: data?.data || [],
    isLoading,
    loadVideos: refetch, // Кнопка "Обновить" вызывает refetch
    handleDelete,
  };
};