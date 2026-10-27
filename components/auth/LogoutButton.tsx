'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut({ redirect: false });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Force hard redirect to home to refresh session and clear router cache
      window.location.href = '/';
    }
  };

  return (
    <Button
      size="small"
      danger
      loading={loading}
      icon={<LogoutOutlined />}
      onClick={handleLogout}
    >
      Đăng xuất
    </Button>
  );
}
