import React from 'react';
import { Spin } from 'antd';

export default function Loading() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <Spin size="large" />
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
        Đang tải dữ liệu Class Deadline Hub...
      </div>
    </div>
  );
}

