'use client';

import { useRouter } from 'next/navigation';
import { AuthPage } from '@/screens/auth/ui/AuthPage';

export const LoginScreen = () => {
  const router = useRouter();

  return (
    <AuthPage 
      onSuccess={() => {
        router.push('/admin');
        router.refresh();
      }} 
    />
  );
};