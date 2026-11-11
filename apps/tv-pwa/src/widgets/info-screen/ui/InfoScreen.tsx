import { Box, Text, Stack, Title } from '@mantine/core';
import { useEffect, useState } from 'react';

export const InfoScreen = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  return (
    <Box 
      w="100vw" 
      h="100vh" 
      bg="black" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: 'white' 
      }}
    >
      <Stack align="center" gap="xl">
        <Title order={1} size={120} fw={700} style={{ fontFamily: 'Raleway, sans-serif', letterSpacing: '-2px' }}>
          {timeString}
        </Title>
        <Text size="xl" c="dimmed" style={{ textTransform: 'capitalize' }}>
          {dateString}
        </Text>
        
        {/* Здесь потом будет QR-код, пока заглушка */}
        <Box mt="xl" p="xl" bg="white" style={{ borderRadius: 16 }}>
          <Text c="black" fw={700} size="xl" ta="center">
            QR-код
          </Text>
          <Text c="dimmed" size="sm" ta="center">
            (Записаться на услугу)
          </Text>
        </Box>
      </Stack>
    </Box>
  );
};