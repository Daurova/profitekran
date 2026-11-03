import { buildApp } from './app.js';

const PORT = Number(process.env['PORT']) || 4000;
const HOST = '0.0.0.0'; // Слушаем все сетевые интерфейсы (чтобы ТВ мог подключиться)

const start = async () => {
  const app = buildApp();

  try {
    // Запускаем сервер на указанном порту
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1); // Если сервер не запустился, выходим с ошибкой
  }
};

start();