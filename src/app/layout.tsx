import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'CognitAI Tender',
  description: 'Автоматизация заполнения тендерной документации',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.className}>
      <body style={{ background: '#0B0F1A', minHeight: '100vh', color: '#CBD5E1' }} className="antialiased">
        {children}
      </body>
    </html>
  );
}
