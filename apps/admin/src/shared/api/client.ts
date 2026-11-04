const API_URL = 'https://profitekran.online/api';

export interface VideoFromDb {
  id: string;
  tenantId: string;
  type: string;
  url: string;
  durationSec: number;
  hasAudio: boolean;
  maxPerHour: number | null;
  cooldownMin: number | null;
  requiresConsent: boolean;
  dayparts: string[];
  createdAt: string;
}

// 1. Получить список видео
export const fetchVideos = async () => {
  const res = await fetch(`${API_URL}/videos`);
  if (!res.ok) throw new Error('Ошибка загрузки');
  return res.json();
};

// 2. Загрузить файл в S3 (через наш API)
export const uploadVideoToS3 = async (file: File): Promise<{ key: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Ошибка загрузки в S3');
  return res.json();
};

// 3. Добавить запись о видео в базу (с метаданными)
export const addVideoToDb = async (data: {
  key: string;
  type: string;
  maxPerHour?: number;
  cooldownMin?: number;
  requiresConsent?: boolean;
}) => {
  const res = await fetch(`${API_URL}/add-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data), // <-- Отправляем весь объект
  });

  if (!res.ok) throw new Error('Ошибка добавления в базу');
  return res.json();
};

// Удалить видео по ID
export const deleteVideoById = async (id: string) => {
  const res = await fetch(`${API_URL}/videos/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Ошибка удаления');
  return res.json();
};