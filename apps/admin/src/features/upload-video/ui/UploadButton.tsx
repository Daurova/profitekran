'use client';

import { Stack, Progress, Alert, FileInput } from '@mantine/core';
import { IconAlertCircle, IconUpload } from '@tabler/icons-react';
import { useUpload } from '../model/useUpload';

export const UploadButton = ({ onSuccess }: { onSuccess: () => void }) => {
  const { upload, isUploading, progress, error } = useUpload(onSuccess);

  return (
    <Stack>
      <FileInput
        placeholder="Нажмите, чтобы выбрать видео"
        accept="video/*"
        leftSection={<IconUpload size={20} />}
        onChange={upload}
        size="lg"
        disabled={isUploading}
        clearable
      />
      
      {isUploading && <Progress value={progress} animated />}
      
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          {error}
        </Alert>
      )}
    </Stack>
  );
};