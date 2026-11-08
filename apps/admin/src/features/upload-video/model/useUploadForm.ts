import { useState, useRef } from 'react';
import { useUpload } from './useUpload';

export const useUploadForm = (onSuccess: () => void) => {
  const resetRef = useRef<(() => void) | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [contentMode, setContentMode] = useState<'base' | 'promo'>('base'); 
  const [promoSubtype, setPromoSubtype] = useState<string>('promo_standard');
  const [orientation, setOrientation] = useState<'HORIZONTAL' | 'VERTICAL'>('HORIZONTAL');
  const [maxPerHour, setMaxPerHour] = useState<number | string>('');
  const [cooldownMin, setCooldownMin] = useState<number | string>('');
  const [requiresConsent, setRequiresConsent] = useState(false);
  const [dayparts, setDayparts] = useState<string[]>(['09-11', '11-14', '14-17', '17-20', '20-22']);

  const { upload, isUploading, progress, error } = useUpload(() => {
    resetRef.current?.();
    setFile(null);
    setMaxPerHour('');
    setCooldownMin('');
    setRequiresConsent(false);
    setOrientation('HORIZONTAL');
    setDayparts(['09-11', '11-14', '14-17', '17-20', '20-22']);
    onSuccess();
  });

  const handleUpload = () => {
    if (!file) return;

    let finalType = 'BASE';
    if (contentMode === 'promo') {
      finalType = promoSubtype === 'anchor' ? 'COFFEE_ANCHOR' : 'PROMO';
    }

    upload({
      file,
      type: finalType,
      orientation,
      maxPerHour: maxPerHour ? Number(maxPerHour) : undefined,
      cooldownMin: cooldownMin ? Number(cooldownMin) : undefined,
      requiresConsent,
      dayparts,
    });
  };

  return {
    resetRef,
    file, setFile,
    contentMode, setContentMode,
    promoSubtype, setPromoSubtype,
    orientation, setOrientation,
    maxPerHour, setMaxPerHour,
    cooldownMin, setCooldownMin,
    requiresConsent, setRequiresConsent,
    dayparts, setDayparts,
    isUploading, progress, error,
    handleUpload,
  };
};