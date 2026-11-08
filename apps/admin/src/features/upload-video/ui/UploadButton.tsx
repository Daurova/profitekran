import { 
  Stack, Progress, Alert, FileInput, Select, NumberInput, 
  Switch, Card, Title, Button, SegmentedControl, Chip, Input, Group 
} from '@mantine/core';
import { IconAlertCircle, IconUpload } from '@tabler/icons-react';
import { useUploadForm } from '../model/useUploadForm';

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

const DAYPART_OPTIONS = [
  { value: '09-11', label: 'Утро (09-11)' },
  { value: '11-14', label: 'День (11-14)' },
  { value: '14-17', label: 'Обед (14-17)' },
  { value: '17-20', label: 'Вечер (17-20)' },
  { value: '20-22', label: 'Ночь (20-22)' },
];

export const UploadButton = ({ onSuccess }: { onSuccess: () => void }) => {
  const form = useUploadForm(onSuccess);

  return (
    <Card withBorder p="xl">
      <Stack gap="lg">
        <Title order={3}>Загрузка нового видео</Title>

        <FileInput
          resetRef={form.resetRef}
          label="Видеофайл"
          placeholder="Нажмите, чтобы выбрать"
          accept="video/*"
          leftSection={<IconUpload size={20} />}
          value={form.file}
          onChange={form.setFile}
          size="lg"
          disabled={form.isUploading}
        />

        <SegmentedControl
          fullWidth
          size="lg"
          value={form.orientation}
          onChange={(val) => form.setOrientation(val as 'HORIZONTAL' | 'VERTICAL')}
          data={ORIENTATIONS}
          disabled={form.isUploading}
        />

        <SegmentedControl
          fullWidth
          size="lg"
          value={form.contentMode}
          onChange={(val) => form.setContentMode(val as 'base' | 'promo')}
          data={CONTENT_MODES}
          disabled={form.isUploading}
        />

        {/* КНОПКИ-ТАБЛЕТКИ ДЛЯ ВЫБОРА ВРЕМЕНИ */}
        <Input.Wrapper
          label="Время показа"
          description="В какие часы крутить это видео?"
        >
          <Chip.Group 
            multiple 
            value={form.dayparts} 
            onChange={form.setDayparts} 
            mt="xs"
          >
            <Group gap="xs">
              {DAYPART_OPTIONS.map((option) => (
                <Chip 
                  key={option.value} 
                  value={option.value} 
                  variant="light" 
                  size="md"
                  disabled={form.isUploading}
                >
                  {option.label}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </Input.Wrapper>

        {form.contentMode === 'promo' && (
          <>
            <Select
              label="Тип рекламы"
              value={form.promoSubtype}
              onChange={(val) => form.setPromoSubtype(val || 'promo_standard')}
              data={PROMO_SUBTYPES}
              size="lg"
              disabled={form.isUploading}
            />
            
            {form.promoSubtype !== 'anchor' && (
              <>
                <NumberInput
                  label="Максимум показов в час"
                  value={form.maxPerHour}
                  onChange={form.setMaxPerHour}
                  size="lg"
                  disabled={form.isUploading}
                />
                <NumberInput
                  label="Кулдаун (минуты)"
                  value={form.cooldownMin}
                  onChange={form.setCooldownMin}
                  size="lg"
                  disabled={form.isUploading}
                />
                <Switch
                  label="Это реклама сотрудника (нужно согласие)"
                  checked={form.requiresConsent}
                  onChange={(e) => form.setRequiresConsent(e.currentTarget.checked)}
                  size="lg"
                  disabled={form.isUploading}
                />
              </>
            )}
          </>
        )}

        <Button
          size="lg"
          onClick={form.handleUpload}
          loading={form.isUploading}
          disabled={!form.file || form.isUploading}
        >
          Загрузить видео
        </Button>

        {form.isUploading && <Progress value={form.progress} animated />}

        {form.error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {form.error}
          </Alert>
        )}
      </Stack>
    </Card>
  );
};