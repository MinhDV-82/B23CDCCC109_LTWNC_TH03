import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Result, Button } from 'antd';

export const metadata: Metadata = {
  title: '403 - Không có quyền truy cập',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForbiddenPage() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <Result
        status="403"
        title="403 - Quyền truy cập bị từ chối"
        subTitle="Xin lỗi, bạn không có quyền Quản trị viên (Admin) để truy cập vào khu vực này."
        extra={[
          <Link href="/dashboard" key="dashboard">
            <Button type="primary">Về Dashboard của tôi</Button>
          </Link>,
          <Link href="/" key="home">
            <Button>Về Trang chủ</Button>
          </Link>,
        ]}
      />
    </div>
  );
}

