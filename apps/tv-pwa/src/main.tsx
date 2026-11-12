import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App'; 
import './app/styles/global.css';
import { registerSW } from 'virtual:pwa-register';

// Автообновление Service Worker каждые 5 минут
const updateSW = registerSW({
  onNeedRefresh() {
    // Если есть новый SW — активируем его без подтверждения
    updateSW(true);
  },
  onOfflineReady() {
    console.log('Приложение готово к работе офлайн');
  },
});

// Проверяем обновления каждые 5 минут
setInterval(() => {
  updateSW();
}, 5 * 60 * 1000);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);