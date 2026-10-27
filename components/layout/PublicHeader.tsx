'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button, Tag, Dropdown, MenuProps } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import styles from './PublicHeader.module.css';

interface SubjectNav {
  slug: string;
  name: string;
}

const DEFAULT_SUBJECTS: SubjectNav[] = [
  { slug: 'lap-trinh-web-nang-cao', name: 'Web Nâng Cao' },
  { slug: 'kien-truc-may-tinh-he-dieu-hanh', name: 'KTMT & HĐH' },
  { slug: 'co-so-du-lieu-phan-tan', name: 'CSDL Phân Tán' },
  { slug: 'an-toan-bao-mat-thong-tin', name: 'An Toàn Bảo Mật' },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const subjectMenuItems: MenuProps['items'] = DEFAULT_SUBJECTS.map((sub) => ({
    key: sub.slug,
    label: <Link href={`/subjects/${sub.slug}`}>{sub.name}</Link>,
  }));

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/';
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <AppstoreOutlined />,
      label: <Link href="/dashboard">Dashboard cá nhân</Link>,
    },
    ...(session?.user?.role === 'admin'
      ? [
          {
            key: 'admin',
            icon: <SettingOutlined />,
            label: <Link href="/admin">Trang quản trị (Admin)</Link>,
          },
        ]
      : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <Image
            src="/logo.svg"
            alt="Logo Class Deadline Hub PTIT"
            width={32}
            height={32}
            priority
            style={{ borderRadius: 6 }}
          />
          <span>Class Deadline Hub</span>
        </Link>

        <nav className={styles.nav} aria-label="Menu điều hướng chính">
          <Link
            href="/"
            className={`${styles.navLink} ${pathname === '/' ? styles.activeNavLink : ''}`}
          >
            Trang chủ
          </Link>

          <Dropdown menu={{ items: subjectMenuItems }} placement="bottom">
            <span
              className={`${styles.navLink} ${
                pathname.startsWith('/subjects') ? styles.activeNavLink : ''
              }`}
              style={{ cursor: 'pointer' }}
            >
              Môn học ▾
            </span>
          </Dropdown>

          <Link
            href="/deadlines"
            className={`${styles.navLink} ${
              pathname.startsWith('/deadlines') ? styles.activeNavLink : ''
            }`}
          >
            Deadline
          </Link>
        </nav>

        <div className={styles.authGroup}>
          {status === 'loading' ? (
            <div style={{ width: 80, height: 32 }} />
          ) : session?.user ? (
            <div className={styles.userInfo}>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button type="default" icon={<UserOutlined />}>
                  <span className={styles.userName}>{session.user.name || session.user.email}</span>
                  <Tag
                    color={session.user.role === 'admin' ? 'blue' : 'green'}
                    className={styles.roleTag}
                    style={{ marginLeft: 6, marginRight: 0 }}
                  >
                    {session.user.role === 'admin' ? 'Admin' : 'Sinh viên'}
                  </Tag>
                </Button>
              </Dropdown>
            </div>
          ) : (
            <Link href="/login">
              <Button type="primary">Đăng nhập</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

