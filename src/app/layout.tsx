import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'
import type { Metadata } from 'next';
import { ModalProvider } from '@/contexts/ModalContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BestPlan - 你的最佳计划助手',
  description: '一个帮助你规划和追踪目标的应用',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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