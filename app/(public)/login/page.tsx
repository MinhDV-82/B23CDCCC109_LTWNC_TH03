import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập vào hệ thống quản lý deadline lớp học PTIT.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 48 }}>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: 40 }}>Đang tải biểu mẫu đăng nhập...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

