export interface VideoFromDb {
  id: string;
  tenantId: string;
  type: string;
  url: string;
  durationSec: number;
  hasAudio: boolean;
  orientation: 'HORIZONTAL' | 'VERTICAL';
  actionUrl: string | null; // <-- ДОБАВИЛИ
  maxPerHour: number | null;
  cooldownMin: number | null;
  requiresConsent: boolean;
  dayparts: string[];
  createdAt: string;
}

export interface ScreenFromDb {
  id: string;
  name: string;
  deviceId: string;
  isActive: boolean;
  tenantId: string;
}

export const API_URL = import.meta.env.VITE_API_URL || 'https://profitekran.online/api';

const getAuthHeaders = () => new Headers();

export const fetchVideos = async (): Promise<{ status: string; data: VideoFromDb[] }> => {
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
  orientation: 'HORIZONTAL' | 'VERTICAL';
  actionUrl?: string; // <-- ДОБАВИЛИ
  maxPerHour?: number;
  cooldownMin?: number;
  requiresConsent?: boolean;
  dayparts?: string[];
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

export const fetchMe = async () => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Неавторизован');
  return res.json();
};

export const addScreen = async (deviceId: string, name: string) => {
  const res = await fetch(`${API_URL}/screens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, name }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Ошибка добавления экрана');
  return res.json();
};

export const logout = async () => {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
};

export const fetchScreens = async (): Promise<{ status: string; data: ScreenFromDb[] }> => {
  const res = await fetch(`${API_URL}/screens`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Ошибка загрузки экранов');
  return res.json();
};

export const deleteScreenById = async (id: string) => {
  const res = await fetch(`${API_URL}/screens/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Ошибка удаления экрана');
  return res.json();
};

export const createWall = async (data: any) => {
  const res = await fetch(`${API_URL}/walls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Ошибка создания стены');
  return res.json();
};

export const fetchWalls = async () => {
  const res = await fetch(`${API_URL}/walls`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Ошибка загрузки стен');
  return res.json();
};