import { useState } from 'react';
import { uploadVideoToS3, addVideoToDb } from '@/shared/api/client';

interface UploadParams {
  file: File;
  type: string;
  maxPerHour?: number;
  cooldownMin?: number;
  requiresConsent?: boolean;
}

export const useUpload = (onSuccess: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (params: UploadParams) => {
    if (!params.file) return;

    if (!params.file.type.startsWith('video/')) {
      setError('Пожалуйста, выберите видеофайл');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(30);

    try {
      // 1. Загружаем файл в S3 (сервер вернет durationSec)
      const uploadData = await uploadVideoToS3(params.file);
      setProgress(70);

      // 2. Отправляем метаданные в базу (включая durationSec)
      await addVideoToDb({
        key: uploadData.key,
        type: params.type,
        durationSec: uploadData.durationSec, // <-- ДОБАВИЛИ
        maxPerHour: params.maxPerHour,
        cooldownMin: params.cooldownMin,
        requiresConsent: params.requiresConsent,
      });

      setProgress(100);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, progress, error };
};