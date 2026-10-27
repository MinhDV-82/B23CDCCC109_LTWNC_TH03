import React from 'react';
import type { Metadata } from 'next';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export const metadata: Metadata = {
  title: 'Bảng Điều Khiển Sinh Viên',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', width: '100%', minHeight: 'calc(100vh - 60px)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

