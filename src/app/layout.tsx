import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '目标追踪器',
  description: '帮助你追踪和实现目标',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
} 