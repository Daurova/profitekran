const SMS_API_KEY = process.env['SMS_API_KEY'];

export const sendSmsCode = async (phone: string, code: string): Promise<void> => {
  // Если ключа нет (локальная разработка) — просто пишем в консоль
  if (!SMS_API_KEY) {
    console.log(`📱 [DEV] ОТПРАВКА СМС на номер ${phone}`);
    console.log(`🔑 [DEV] КОД: ${code}`);
    return;
  }

  // Очищаем номер от лишних символов (оставляем только цифры)
  const cleanPhone = phone.replace(/\D/g, '');

  // API SMS Pilot: параметр send — это текст, to — номер, apikey — ключ
  const url = `https://smspilot.ru/api.php?send=${encodeURIComponent(`Код для входа в ВДОХНОВЕНИЕ: ${code}`)}&to=${cleanPhone}&apikey=${SMS_API_KEY}&format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json() as { error?: { description_ru?: string; description?: string } };
    if (data.error) {
      console.error('Ошибка отправки СМС:', data.error.description_ru || data.error.description);
    } else {
      console.log(`СМС успешно отправлено на ${phone}`);
    }
  } catch (error) {
    console.error('Ошибка сети при отправке СМС:', error);
  }
};