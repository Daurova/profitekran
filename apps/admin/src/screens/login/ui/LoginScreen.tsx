'use client';

import { AuthPage } from '@/screens/auth/ui/AuthPage';

export const LoginScreen = () => {
  const handleSuccess = () => {
    const url = '/admin';
    window.location.href = url;
  };

  return <AuthPage onSuccess={handleSuccess} />;
};