import { useState } from 'react';

const API_URL = 'https://profitekran.online/api';

export const useAuth = (onSuccess: () => void) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendCode = async () => {
    if (!phone) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка отправки');
      
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить код');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка входа');

      localStorage.setItem('admin_token', data.token);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неверный код');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    phone, setPhone,
    code, setCode,
    step, setStep,
    error,
    isLoading,
    sendCode,
    verifyCode,
  };
};