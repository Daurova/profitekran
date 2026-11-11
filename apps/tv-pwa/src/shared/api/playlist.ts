import { type ContentItem } from '../../pages/home/HomePage';

export const fetchPlaylist = async (deviceId: string): Promise<{ 
  status: string; 
  data?: 
  ContentItem[]; 
  error?: string  
  isWall?: boolean;    
  wallRole?: string;
  infoText?: string; 
  qrUrl?: string; 
}> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`/api/playlist?deviceId=${deviceId}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.status === 403) {
      return { status: 'unauthorized' };
    }

    if (!response.ok) throw new Error('Ошибка сервера');

    const json = await response.json();
    return json;
  } catch (err) {
    throw err;
  }
};