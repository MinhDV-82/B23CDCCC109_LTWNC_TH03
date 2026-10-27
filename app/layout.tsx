import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AntdProvider from '@/components/providers/AntdProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    template: '%s | Class Deadline Hub',
    default: 'Class Deadline Hub - Cổng Quản Lý Deadline Lớp Học PTIT',
  },
  description:
    'Hệ thống theo dõi thời hạn học tập, đồ án, bài tập lớn và môn học dành riêng cho sinh viên Học viện Công nghệ Bưu chính Viễn thông (PTIT).',
  keywords: ['deadline', 'sinh viên PTIT', 'quản lý thời hạn', 'học tập', 'Next.js App Router'],
  authors: [{ name: 'Class Deadline Hub Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>
        <a href="#main-content" className="skip-to-content">
          Chuyển đến nội dung chính
        </a>
        <AuthProvider>
          <AntdProvider>{children}</AntdProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

