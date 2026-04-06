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
      <body className="bg-[#F9FAFB] min-h-screen text-[#111827] antialiased">
        {children}
      </body>
    </html>
  );
}
