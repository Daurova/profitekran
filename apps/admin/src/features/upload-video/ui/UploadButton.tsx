import { useState, useRef } from 'react';
import { 
  Stack, Progress, Alert, FileInput, Select, NumberInput, 
  Switch, Card, Title, Button, SegmentedControl 
} from '@mantine/core';
import { IconAlertCircle, IconUpload } from '@tabler/icons-react';
import { useUpload } from '../model/useUpload';

// Константы (Big Tech Way: выносим магические строки)
const ORIENTATIONS = [
  { label: 'Горизонтальное (ТВ)', value: 'HORIZONTAL' },
  { label: 'Вертикальное (Reels)', value: 'VERTICAL' },
];

const CONTENT_MODES = [
  { label: 'Основное видео', value: 'base' },
  { label: 'Реклама', value: 'promo' },
];

const PROMO_SUBTYPES = [
  { value: 'promo_standard', label: 'Обычная реклама' },
  { value: 'anchor', label: 'Короткая заставка' },
];

export const UploadButton = ({ onSuccess }: { onSuccess: () => void }) => {
  // Исправленный тип для ref
  const resetRef = useRef<(() => void) | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [contentMode, setContentMode] = useState<'base' | 'promo'>('base'); 
  const [promoSubtype, setPromoSubtype] = useState<string>('promo_standard');
  const [orientation, setOrientation] = useState<'HORIZONTAL' | 'VERTICAL'>('HORIZONTAL');
  const [maxPerHour, setMaxPerHour] = useState<number | string>('');
  const [cooldownMin, setCooldownMin] = useState<number | string>('');
  const [requiresConsent, setRequiresConsent] = useState(false);

  const { upload, isUploading, progress, error } = useUpload(() => {
    resetRef.current?.();
    setFile(null);
    setMaxPerHour('');
    setCooldownMin('');
    setRequiresConsent(false);
    setOrientation('HORIZONTAL');
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
    });
  };

  return (
    <Card withBorder p="xl">
      <Stack gap="lg">
        <Title order={3}>Загрузка нового видео</Title>

        <FileInput
          resetRef={resetRef}
          label="Видеофайл"
          placeholder="Нажмите, чтобы выбрать"
          accept="video/*"
          leftSection={<IconUpload size={20} />}
          value={file}
          onChange={setFile}
          size="lg"
          disabled={isUploading}
        />

        <SegmentedControl
          fullWidth
          size="lg"
          value={orientation}
          onChange={(val) => setOrientation(val as 'HORIZONTAL' | 'VERTICAL')}
          data={ORIENTATIONS}
          disabled={isUploading}
        />

        <SegmentedControl
          fullWidth
          size="lg"
          value={contentMode}
          onChange={(val) => setContentMode(val as 'base' | 'promo')}
          data={CONTENT_MODES}
          disabled={isUploading}
        />

        {contentMode === 'promo' && (
          <>
            <Select
              label="Тип рекламы"
              value={promoSubtype}
              onChange={(val) => setPromoSubtype(val || 'promo_standard')}
              data={PROMO_SUBTYPES}
              size="lg"
              disabled={isUploading}
            />
            
            {promoSubtype !== 'anchor' && (
              <>
                <NumberInput
                  label="Максимум показов в час"
                  value={maxPerHour}
                  onChange={setMaxPerHour}
                  size="lg"
                  disabled={isUploading}
                />
                <NumberInput
                  label="Кулдаун (минуты)"
                  value={cooldownMin}
                  onChange={setCooldownMin}
                  size="lg"
                  disabled={isUploading}
                />
                <Switch
                  label="Это реклама сотрудника (нужно согласие)"
                  checked={requiresConsent}
                  onChange={(e) => setRequiresConsent(e.currentTarget.checked)}
                  size="lg"
                  disabled={isUploading}
                />
              </>
            )}
          </>
        )}

        <Button
          size="lg"
          onClick={handleUpload}
          loading={isUploading}
          disabled={!file || isUploading}
        >
          Загрузить видео
        </Button>

        {isUploading && <Progress value={progress} animated />}

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {error}
          </Alert>
        )}
      </Stack>
    </Card>
  );
};