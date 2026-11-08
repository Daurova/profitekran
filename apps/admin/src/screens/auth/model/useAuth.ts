import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://profitekran.online/api';

export const useAuth = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [companyName, setCompanyName] = useState(''); // <-- Для онбординга
  const [step, setStep] = useState<'phone' | 'code' | 'onboarding'>('phone'); // <-- Добавили шаг
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const sendCode = async () => {
    if (!phone) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
        credentials: 'include',
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
        credentials: 'include',
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка входа');

      // Если новый пользователь — показываем онбординг
      if (data.isNewUser) {
        setStep('onboarding');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неверный код');
    } finally {
      setIsLoading(false);
    }
  };

  const saveCompanyName = async () => {
    if (!companyName) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/tenant/name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyName }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Ошибка сохранения');
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить название');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    phone, setPhone,
    code, setCode,
    companyName, setCompanyName,
    step, setStep,
    error,
    isLoading,
    sendCode,
    verifyCode,
    saveCompanyName,
  };
};