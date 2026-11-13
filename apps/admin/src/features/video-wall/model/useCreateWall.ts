import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { uploadVideoToS3, createWall } from '@/shared/api/client';

export const useCreateWall = (onSuccess: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: any) => {
      // 1. Загружаем базовые видео в S3
      const baseVideosWithKeys = await Promise.all(
        formData.baseContent.videos.map(async (v: any) => {
          if (!v.file) return v;
          const uploadData = await uploadVideoToS3(v.file);
          return { ...v, url: uploadData.key, file: undefined };
        })
      );

      // 2. Загружаем рекламные видео в S3
      const promoVideosWithKeys = await Promise.all(
        formData.promoContent.map(async (v: any) => {
          if (!v.file) return v;
          const uploadData = await uploadVideoToS3(v.file);
          return { ...v, url: uploadData.key, file: undefined };
        })
      );

      // 3. Формируем данные для API
      const finalData = {
        ...formData,
        baseContent: { videos: baseVideosWithKeys },
        promoContent: promoVideosWithKeys,
      };

      // 4. Отправляем на бэкенд
      return await createWall(finalData);
    },
    onSuccess: () => {
      notifications.show({ title: 'Успех', message: 'Медиастена создана', color: 'green' });
      queryClient.invalidateQueries({ queryKey: ['walls'] });
      onSuccess();
    },
    onError: (err) => {
      console.error(err);
      notifications.show({ 
        title: 'Ошибка', 
        message: err instanceof Error ? err.message : 'Не удалось создать стену', 
        color: 'red' 
      });
    },
  });
};