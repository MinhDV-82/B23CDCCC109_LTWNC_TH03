import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Breadcrumb } from 'antd';
import { getDeadlines, getSubjects } from '@/lib/data-repository';
import DeadlineFilterView from '@/components/deadline/DeadlineFilterView';

// ISR Configuration: Revalidate every 60 seconds
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Danh sách Deadline Học tập',
  description:
    'Tra cứu và lọc tất cả deadline bài tập lớn, thực hành lab và đồ án của các môn học sinh viên PTIT.',
};

export default async function DeadlinesPage() {
  const [deadlines, subjects] = await Promise.all([
    getDeadlines(),
    getSubjects(),
  ]);

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link href="/">Trang chủ</Link> },
          { title: 'Danh sách Deadline' },
        ]}
      />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Danh Sách Toàn Bộ Deadline
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Tìm kiếm bài tập theo từ khóa, lọc theo học phần môn học hoặc trạng thái thời hạn.
        </p>
      </div>

      <DeadlineFilterView initialDeadlines={deadlines} subjects={subjects} />
    </div>
  );
}

