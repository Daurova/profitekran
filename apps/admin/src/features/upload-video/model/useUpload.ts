import { useState } from 'react';
import { uploadVideoToS3, addVideoToDb } from '@/shared/api/client';

interface UploadParams {
  file: File;
  type: string;
  orientation: 'HORIZONTAL' | 'VERTICAL';
  actionUrl?: string; // <-- ДОБАВИЛИ
  maxPerHour?: number;
  cooldownMin?: number;
  requiresConsent?: boolean;
  dayparts?: string[];
}

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const useUpload = (onSuccess: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (params: UploadParams) => {
    if (!params.file) return;

    // 1. Проверка типа файла
    if (!params.file.type.startsWith('video/')) {
      setError('Пожалуйста, выберите видеофайл (mp4, webm и т.д.)');
      return;
    }

    // 2. Проверка размера файла
    if (params.file.size > MAX_FILE_SIZE_BYTES) {
      setError(`Файл слишком большой. Максимум ${MAX_FILE_SIZE_MB} МБ.`);
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(30);

    try {
      const uploadData = await uploadVideoToS3(params.file);
      setProgress(70);

      await addVideoToDb({
        key: uploadData.key,
        type: params.type,
        durationSec: uploadData.durationSec,
        orientation: params.orientation,
        actionUrl: params.actionUrl, // <-- ПЕРЕДАЕМ
        maxPerHour: params.maxPerHour,
        cooldownMin: params.cooldownMin,
        requiresConsent: params.requiresConsent,
        dayparts: params.dayparts,
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