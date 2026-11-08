import { TextInput, Button, Stack, Paper, Title, Alert } from '@mantine/core';
import { IconPhone, IconKey, IconAlertCircle, IconBuildingStore } from '@tabler/icons-react';
import { useAuth } from '../model/useAuth';

export const AuthPage = () => {
  const {
    phone, setPhone,
    code, setCode,
    companyName, setCompanyName,
    step, setStep,
    error,
    isLoading,
    sendCode,
    verifyCode,
    saveCompanyName,
  } = useAuth();

  return (
    <Paper p="xl" radius="md" withBorder style={{ maxWidth: 400, margin: '100px auto' }}>
      <Stack gap="md">
        <Title order={2} ta="center">
          {step === 'phone' && 'Вход в Админку'}
          {step === 'code' && 'Введите код из СМС'}
          {step === 'onboarding' && 'Название компании'}
        </Title>

        {step === 'phone' && (
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
        )}

        {step === 'code' && (
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

        {step === 'onboarding' && (
          <>
            <TextInput
              label="Как называется ваша компания?"
              placeholder="Например: Кофейня 'Вдохновение'"
              leftSection={<IconBuildingStore size={16} />}
              value={companyName}
              onChange={(e) => setCompanyName(e.currentTarget.value)}
              size="lg"
            />
            <Button size="lg" fullWidth onClick={saveCompanyName} loading={isLoading}>
              Продолжить
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