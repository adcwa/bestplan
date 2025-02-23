import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'
import type { Metadata } from 'next';
import { ModalProvider } from '@/contexts/ModalContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Best Year of My Life',
  description: '记录和规划你的人生目标',
  icons: {
    icon: [
      {
        url: '/icon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/icon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        url: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      }
    ],
    shortcut: ['/icon.svg'],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      }
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('Layout rendering'); // 添加调试日志

  return (
    <html lang="zh">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 