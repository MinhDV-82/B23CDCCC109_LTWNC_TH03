import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth';
import { Button, Tag } from 'antd';
import { HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import LogoutButton from '@/components/auth/LogoutButton';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      {/* App Topbar */}
      <header
        style={{
          height: 60,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image
              src="/logo.svg"
              alt="Logo PTIT"
              width={28}
              height={28}
              style={{ borderRadius: 6 }}
            />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Class Deadline Hub
            </span>
          </Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <Link href="/">
            <Button size="small" type="text" icon={<HomeOutlined />}>
              Xem trang công khai
            </Button>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {session.user.name || session.user.email}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {session.user.email}
            </div>
          </div>
          <Tag color={session.user.role === 'admin' ? 'blue' : 'green'}>
            {session.user.role === 'admin' ? 'Admin' : 'Sinh viên'}
          </Tag>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex' }}>
        {children}
      </div>
    </div>
  );
}

