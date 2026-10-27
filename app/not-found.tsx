import React from 'react';
import Link from 'next/link';
import { Result, Button } from 'antd';

export default function NotFound() {
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
        status="404"
        title="404 - Không tìm thấy trang"
        subTitle="Đường dẫn hoặc tài nguyên bạn đang tìm kiếm không tồn tại hoặc đã được cập nhật."
        extra={
          <Link href="/">
            <Button type="primary">Quay về Trang chủ</Button>
          </Link>
        }
      />
    </div>
  );
}

