'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UnorderedListOutlined,
  HomeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';

type MenuItem = Required<MenuProps>['items'][number];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const getSelectedKey = () => {
    if (pathname === '/dashboard/completed') return 'completed';
    if (pathname === '/dashboard/pending') return 'pending';
    if (pathname === '/dashboard') return 'overview';
    return 'overview';
  };

  const items: MenuItem[] = [
    {
      key: 'overview',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Tổng quan</Link>,
    },
    {
      key: 'pending',
      icon: <ClockCircleOutlined />,
      label: <Link href="/dashboard/pending">Deadline chưa hoàn thành</Link>,
    },
    {
      key: 'completed',
      icon: <CheckCircleOutlined />,
      label: <Link href="/dashboard/completed">Deadline đã hoàn thành</Link>,
    },
    {
      type: 'divider',
    },
    ...(session?.user?.role === 'admin'
      ? [
          {
            key: 'admin',
            icon: <SettingOutlined />,
            label: <Link href="/admin">Khu vực Quản trị (Admin)</Link>,
          },
        ]
      : []),
    {
      key: 'public-home',
      icon: <HomeOutlined />,
      label: <Link href="/">Quay về trang công khai</Link>,
    },
  ];

  return (
    <aside
      style={{
        width: 250,
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border)',
        padding: '24px 12px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '0 12px 16px', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
          Sinh viên Portal
        </div>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Bảng Điều Khiển
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        style={{ borderRight: 0 }}
        items={items}
      />
    </aside>
  );
}

