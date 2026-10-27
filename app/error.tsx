'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Result, Button } from 'antd';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error info
    console.error('[Application ErrorBoundary]:', error.message);
  }, [error]);

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
        status="500"
        title="Đã xảy ra sự cố"
        subTitle="Hệ thống gặp lỗi trong quá trình xử lý yêu cầu. Vui lòng thử lại hoặc quay lại trang chủ."
        extra={[
          <Button type="primary" key="retry" onClick={() => reset()}>
            Thử lại
          </Button>,
          <Link href="/" key="home">
            <Button>Về Trang chủ</Button>
          </Link>,
        ]}
      />
    </div>
  );
}

