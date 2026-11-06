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

// В Vite переменные окружения начинаются с VITE_
const API_URL = import.meta.env.VITE_API_URL || 'https://profitekran.online/api';

const getAuthHeaders = () => {
  const headers = new Headers();
  // В Vite мы используем куки, они ставятся автоматически браузером
  return headers;
};

export const fetchVideos = async () => {
  const res = await fetch(`${API_URL}/videos`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Ошибка загрузки');
  return res.json();
};

export const uploadVideoToS3 = async (file: File): Promise<{ key: string; durationSec: number }> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Ошибка загрузки в S3');
  return res.json();
};

export const addVideoToDb = async (data: {
  key: string;
  type: string;
  durationSec: number;
  maxPerHour?: number;
  cooldownMin?: number;
  requiresConsent?: boolean;
}) => {
  const res = await fetch(`${API_URL}/add-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Ошибка добавления в базу');
  return res.json();
};

export const deleteVideoById = async (id: string) => {
  const res = await fetch(`${API_URL}/videos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Ошибка удаления');
  return res.json();
};