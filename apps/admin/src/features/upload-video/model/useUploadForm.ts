import { useState, useRef } from 'react';
import { useUpload } from './useUpload';

export const useUploadForm = (onSuccess: () => void) => {
  const resetRef = useRef<(() => void) | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState<string>('BASE');
  const [orientation, setOrientation] = useState<'HORIZONTAL' | 'VERTICAL'>('HORIZONTAL');
  const [actionUrl, setActionUrl] = useState<string>(''); // <-- ДОБАВИЛИ
  const [maxPerHour, setMaxPerHour] = useState<number | string>('');
  const [cooldownMin, setCooldownMin] = useState<number | string>('');
  const [requiresConsent, setRequiresConsent] = useState(false);
  const [dayparts, setDayparts] = useState<string[]>(['09-11', '11-14', '14-17', '17-20', '20-22']);

  const { upload, isUploading, progress, error } = useUpload(() => {
    resetRef.current?.();
    setFile(null);
    setContentType('BASE');
    setActionUrl('');
    setMaxPerHour('');
    setCooldownMin('');
    setRequiresConsent(false);
    setOrientation('HORIZONTAL');
    setDayparts(['09-11', '11-14', '14-17', '17-20', '20-22']);
    onSuccess();
  });

  const handleUpload = () => {
    if (!file) return;

    upload({
      file,
      type: contentType, // <-- ПЕРЕДАЕМ НАПРЯМУЮ ТИП
      orientation,
      actionUrl: actionUrl || undefined, // <-- ПЕРЕДАЕМ ССЫЛКУ
      maxPerHour: maxPerHour ? Number(maxPerHour) : undefined,
      cooldownMin: cooldownMin ? Number(cooldownMin) : undefined,
      requiresConsent,
      dayparts,
    });
  };

  return {
    resetRef,
    file, setFile,
    contentType, setContentType,
    orientation, setOrientation,
    actionUrl, setActionUrl, // <-- ВОЗВРАЩАЕМ
    maxPerHour, setMaxPerHour,
    cooldownMin, setCooldownMin,
    requiresConsent, setRequiresConsent,
    dayparts, setDayparts,
    isUploading, progress, error,
    handleUpload,
  };
};