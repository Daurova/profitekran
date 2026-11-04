import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'Админка',
  description: 'Управление контентом',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}