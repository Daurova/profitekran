export interface WallRoleConfig {
  label: string;
  role: string;
  isInfo: boolean;
  height: number;
}

export const WALL_LAYOUTS: Record<string, WallRoleConfig[]> = {
  '2_h': [
    { label: 'Экран 1: Видео', role: 'VIDEO_FULL', isInfo: false, height: 120 },
    { label: 'Экран 2: Инфо', role: 'INFO', isInfo: true, height: 120 },
  ],
  '2_v': [
    { label: 'Экран 1: Видео', role: 'VIDEO_FULL', isInfo: false, height: 120 },
    { label: 'Экран 2: Инфо', role: 'INFO', isInfo: true, height: 80 },
  ],
  '3_h': [
    { label: 'Экран 1: Видео (лево)', role: 'VIDEO_LEFT', isInfo: false, height: 120 },
    { label: 'Экран 2: Видео (право)', role: 'VIDEO_RIGHT', isInfo: false, height: 120 },
    { label: 'Экран 3: Инфо', role: 'INFO', isInfo: true, height: 120 },
  ],
  '3_v': [
    { label: 'Экран 1: Видео (верх)', role: 'VIDEO_TOP', isInfo: false, height: 100 },
    { label: 'Экран 2: Видео (низ)', role: 'VIDEO_BOTTOM', isInfo: false, height: 100 },
    { label: 'Экран 3: Инфо', role: 'INFO', isInfo: true, height: 60 },
  ],
};

export const getLayoutRoles = (layout: string): WallRoleConfig[] => {
  return WALL_LAYOUTS[layout] || WALL_LAYOUTS['3_v'];
};