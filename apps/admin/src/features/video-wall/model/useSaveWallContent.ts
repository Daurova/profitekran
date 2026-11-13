import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { uploadVideoToS3, saveWallContent } from '@/shared/api/client';

export const useSaveWallContent = (onSuccess: () => void) => {
  const [isSaving, setIsSaving] = useState(false);

  const save = async (wallId: string, data: any) => {
    setIsSaving(true);
    try {
      // 1. Загружаем базовые видео в S3
      const baseVideosWithKeys = await Promise.all(
        data.baseContent.videos.map(async (v: any) => {
          if (!v.file) return v;
          const uploadData = await uploadVideoToS3(v.file);
          return { ...v, url: uploadData.key, file: undefined, durationSec: uploadData.durationSec };
        })
      );

      // 2. Загружаем рекламные видео в S3
      const promoVideosWithKeys = await Promise.all(
        data.promoContent.map(async (v: any) => {
          if (!v.file) return v;
          const uploadData = await uploadVideoToS3(v.file);
          return { ...v, url: uploadData.key, file: undefined, durationSec: uploadData.durationSec };
        })
      );

      // 3. Отправляем на сервер
      await saveWallContent(wallId, {
        baseContent: { videos: baseVideosWithKeys },
        infoContent: data.infoContent,
        promoContent: promoVideosWithKeys,
      });

      notifications.show({ title: 'Успех', message: 'Контент сохранен', color: 'green' });
      onSuccess();
    } catch (err) {
      console.error(err);
      notifications.show({ title: 'Ошибка', message: 'Не удалось сохранить контент', color: 'red' });
    } finally {
      setIsSaving(false);
    }
  };

  return { save, isSaving };
};