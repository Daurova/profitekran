import { useState, useEffect } from 'react';

interface ClockProps {
  className?: string;
}

export const Clock = ({ className }: ClockProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Обновляем время каждую секунду
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={className}>
      {/* Форматируем время как ЧЧ:ММ */}
      {time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
    </div>
  );
};