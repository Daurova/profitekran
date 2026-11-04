import { useState } from 'react';
import { uploadVideoToS3, addVideoToDb } from '@/shared/api/client';

export const useUpload = (onSuccess: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Пожалуйста, выберите видеофайл');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(30);

    try {
      const uploadData = await uploadVideoToS3(file);
      setProgress(70);
      await addVideoToDb(uploadData.key, 'BASE');
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