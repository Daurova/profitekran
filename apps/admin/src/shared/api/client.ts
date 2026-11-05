const API_URL = 'https://explanation-outputs-pierce-another.trycloudflare.com';

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

// Хелпер, который автоматически добавляет токен
const getAuthHeaders = () => {
  const headers = new Headers();
  const token = localStorage.getItem('admin_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

// 1. Получить список видео
export const fetchVideos = async () => {
  const res = await fetch(`${API_URL}/videos`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.reload();
    }
    throw new Error('Ошибка загрузки');
  }
  return res.json();
};

// 2. Загрузить файл в S3
export const uploadVideoToS3 = async (file: File): Promise<{ key: string; durationSec: number }> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: formData,
  });

  if (!res.ok) throw new Error('Ошибка загрузки в S3');
  return res.json();
};

// 3. Добавить запись о видео в базу
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
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders() 
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Ошибка добавления в базу');
  return res.json();
};

// 4. Удалить видео по ID
export const deleteVideoById = async (id: string) => {
  const res = await fetch(`${API_URL}/videos/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error('Ошибка удаления');
  return res.json();
};