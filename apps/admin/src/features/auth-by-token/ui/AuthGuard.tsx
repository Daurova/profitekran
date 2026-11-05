'use client';

import { useState } from 'react';
import { AuthPage } from '@/screens/auth/ui/AuthPage';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  // ЛЕНИВАЯ ИНИЦИАЛИЗАЦИЯ: читаем localStorage прямо при создании стейта
  const [isAuth, setIsAuth] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('admin_token');
    }
    return false;
  });

  // Если не авторизован — показываем форму входа
  if (!isAuth) {
    return <AuthPage onSuccess={() => setIsAuth(true)} />;
  }

  // Если авторизован — пропускаем дальше
  return <>{children}</>;
};