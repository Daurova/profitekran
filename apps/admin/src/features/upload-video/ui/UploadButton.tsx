'use client';

import { useState } from 'react';
import { Stack, Progress, Alert, FileInput, Select, NumberInput, Switch, Card, Title, Button, SegmentedControl } from '@mantine/core';
import { IconAlertCircle, IconUpload } from '@tabler/icons-react';
import { useUpload } from '../model/useUpload';

export const UploadButton = ({ onSuccess }: { onSuccess: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  
  // Универсальные типы, понятные любому бизнесу
  const [contentMode, setContentMode] = useState<'base' | 'promo'>('base'); 
  const [promoSubtype, setPromoSubtype] = useState<string>('promo_standard');
  
  const [maxPerHour, setMaxPerHour] = useState<number | string>('');
  const [cooldownMin, setCooldownMin] = useState<number | string>('');
  const [requiresConsent, setRequiresConsent] = useState(false);

  const { upload, isUploading, progress, error } = useUpload(onSuccess);

  const handleUpload = () => {
    if (!file) return;

    // Маппинг универсальных типов в наши технические типы БД
    let finalType = 'BASE';
    if (contentMode === 'promo') {
      finalType = promoSubtype === 'anchor' ? 'COFFEE_ANCHOR' : 'PROMO';
    }

    upload({
      file,
      type: finalType,
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
          value={contentMode}
          onChange={(val) => setContentMode(val as 'base' | 'promo')}
          data={[
            { label: 'Основное видео', value: 'base' },
            { label: 'Реклама', value: 'promo' },
          ]}
          disabled={isUploading}
        />

        {contentMode === 'promo' && (
          <>
            <Select
              label="Тип рекламы"
              value={promoSubtype}
              onChange={(val) => setPromoSubtype(val || 'promo_standard')}
              data={[
                { value: 'promo_standard', label: 'Обычная реклама (услуги, товары)' },
                { value: 'anchor', label: 'Короткая заставка (6 секунд, без текста)' },
              ]}
              size="lg"
              disabled={isUploading}
            />
            
            {promoSubtype !== 'anchor' && (
              <>
                <NumberInput
                  label="Максимум показов в час"
                  description="Сколько раз можно показать этот ролик за час"
                  value={maxPerHour}
                  onChange={setMaxPerHour}
                  size="lg"
                  disabled={isUploading}
                />
                <NumberInput
                  label="Кулдаун (в минутах)"
                  description="Через сколько минут ролик можно показать снова"
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