import { TextInput, Button, Stack, Paper, Title, Alert } from '@mantine/core';
import { IconPhone, IconKey, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../model/useAuth';

export const AuthPage = () => {
  const {
    phone, setPhone,
    code, setCode,
    step, setStep,
    error,
    isLoading,
    sendCode,
    verifyCode,
  } = useAuth();

  return (
    <Paper p="xl" radius="md" withBorder style={{ maxWidth: 400, margin: '100px auto' }}>
      <Stack gap="md">
        <Title order={2} ta="center">
          {step === 'phone' ? 'Вход в Админку' : 'Введите код из СМС'}
        </Title>

        {step === 'phone' ? (
          <>
            <TextInput
              label="Номер телефона"
              placeholder="+7 999 123-45-67"
              leftSection={<IconPhone size={16} />}
              value={phone}
              onChange={(e) => setPhone(e.currentTarget.value)}
              size="lg"
            />
            <Button size="lg" fullWidth onClick={sendCode} loading={isLoading}>
              Получить код
            </Button>
          </>
        ) : (
          <>
            <TextInput
              label="Код из СМС"
              placeholder="1234"
              leftSection={<IconKey size={16} />}
              value={code}
              onChange={(e) => setCode(e.currentTarget.value)}
              size="lg"
            />
            <Button size="lg" fullWidth onClick={verifyCode} loading={isLoading}>
              Войти
            </Button>
            <Button variant="subtle" size="xs" onClick={() => setStep('phone')}>
              Изменить номер
            </Button>
          </>
        )}

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {error}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};