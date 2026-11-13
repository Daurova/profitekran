import { Box, Text, Stack, Title } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';

export const InfoScreen = ({ schedule }: { schedule: any[] }) => {
  const [time, setTime] = useState(new Date());
  const [currentQr, setCurrentQr] = useState('');
  const [currentText, setCurrentText] = useState('');
  
  // Храним ID текущего слота, чтобы проверять версию только при смене
  const lastSlotIdRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setInterval(async () => {
      const now = Date.now();
      setTime(new Date(now));

      const currentSlot = schedule.find(
        s => now >= s.startTime && now < s.endTime
      );

      if (currentSlot) {
        setCurrentQr(currentSlot.qrUrl || '');
        setCurrentText(currentSlot.infoText || '');

        // ПРОВЕРКА ВЕРСИИ: только если слот сменился (а не каждую секунду)
        const slotId = String(currentSlot.startTime);
        if (lastSlotIdRef.current !== slotId) {
          lastSlotIdRef.current = slotId;

          try {
            const deviceId = localStorage.getItem('device_id');
            if (deviceId) {
              const res = await fetch(`/api/playlist?deviceId=${deviceId}`);
              const data = await res.json();
              
              if (data.playlistVersion) {
                const cachedVersion = Number(localStorage.getItem('playlist_version') || '1');
                if (data.playlistVersion > cachedVersion) {
                  console.log('InfoScreen: новая версия плейлиста! Перезагружаем...');
                  localStorage.setItem('playlist_version', String(data.playlistVersion));
                  window.location.reload();
                }
              }
            }
          } catch (e) {
            // Игнорируем ошибки сети
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [schedule]);

  const timeString = time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  return (
    <Box 
      w="100vw" 
      h="100vh" 
      bg="black" 
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}
    >
      <Stack align="center" gap="xl">
        <Title order={1} size={120} fw={700} style={{ fontFamily: 'Raleway, sans-serif', letterSpacing: '-2px' }}>
          {timeString}
        </Title>
        <Text size="xl" c="dimmed" style={{ textTransform: 'capitalize' }}>
          {dateString}
        </Text>
        
        <Box mt="xl" p="xl" bg="white" style={{ borderRadius: 16 }}>
          {currentQr && (
            <QRCode 
              value={currentQr} 
              size={200} 
              style={{ height: "auto", maxWidth: "100%", width: "100%" }} 
            />
          )}
          <Text c="black" fw={700} size="xl" ta="center" mt="md">
            {currentText || 'Записаться'}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
};