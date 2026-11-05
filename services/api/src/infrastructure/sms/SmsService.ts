// В будущем здесь будет реальный клиент SMS.RU
export const sendSmsCode = async (phone: string, code: string): Promise<void> => {
  // Пока мы не подключили реальный SMS-шлюз, мы просто выводим код в консоль.
  // Это стандартная практика в Big Tech для локальной разработки.
  console.log('=========================================');
  console.log(`📱 ОТПРАВКА СМС на номер ${phone}`);
  console.log(`🔑 КОД: ${code}`);
  console.log('=========================================');
  
  // ЗАГЛУШКА: Здесь будет вызов SMS.RU
  // await fetch(`https://sms.ru/sms/send?api_id=${process.env.SMSRU_API_ID}&to=${phone}&msg=Ваш код: ${code}&json=1`);
};