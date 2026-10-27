import React from 'react';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getServerAuthSession } from '@/lib/auth';
import { getDeadlines, getSubjects } from '@/lib/data-repository';
import AdminDeadlineManager from '@/components/admin/AdminDeadlineManager';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Quản Trị Hệ Thống - Class Deadline Hub',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const session = await getServerAuthSession();

  // 1. Unauthenticated -> redirect to /login with callbackUrl
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  // 2. Authenticated but not admin -> redirect to /403
  if (session.user.role !== 'admin') {
    redirect('/403');
  }

  const [deadlines, subjects] = await Promise.all([
    getDeadlines(),
    getSubjects(),
  ]);

  return (
    <div style={{ padding: '32px 36px', width: '100%' }}>
      <AdminDeadlineManager initialDeadlines={deadlines} subjects={subjects} />
    </div>
  );
}

