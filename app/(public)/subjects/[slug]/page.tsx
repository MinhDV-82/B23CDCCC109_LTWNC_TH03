import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Breadcrumb, Button, Tag, Empty } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { getSubjects, getSubjectBySlug, getDeadlinesBySubjectId } from '@/lib/data-repository';
import DeadlineCountdown from '@/components/deadline/DeadlineCountdown';

interface SubjectPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for SSG prerendering of all 4 subjects
export async function generateStaticParams() {
  const subjects = await getSubjects();
  return subjects.map((sub) => ({
    slug: sub.slug,
  }));
}

// Dynamic metadata for Subject page
export async function generateMetadata({ params }: SubjectPageProps): Promise<Metadata> {
  const subject = await getSubjectBySlug(params.slug);
  if (!subject) {
    return {
      title: 'Không tìm thấy môn học',
    };
  }

  return {
    title: `${subject.name} (${subject.code})`,
    description: subject.description,
    openGraph: {
      title: `${subject.name} (${subject.code}) - Class Deadline Hub`,
      description: subject.description,
      type: 'article',
    },
  };
}

export default async function SubjectDetailPage({ params }: SubjectPageProps) {
  const subject = await getSubjectBySlug(params.slug);

  if (!subject) {
    notFound();
  }

  const deadlines = await getDeadlinesBySubjectId(subject.id);

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link href="/">Trang chủ</Link> },
          { title: 'Môn học' },
          { title: subject.name },
        ]}
      />

      {/* Header section */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          marginBottom: 32,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Tag color="blue" style={{ fontSize: '0.85rem', fontWeight: 700, padding: '3px 10px' }}>
                {subject.code}
              </Tag>
              {subject.credits && (
                <Tag color="default" style={{ fontSize: '0.8rem' }}>
                  {subject.credits} Tín chỉ
                </Tag>
              )}
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
              {subject.name}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 800, lineHeight: 1.6, marginBottom: 16 }}>
              {subject.description}
            </p>

            {subject.lecturer && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
                <UserOutlined style={{ color: 'var(--primary)' }} />
                <span>Giảng viên phụ trách: <strong>{subject.lecturer}</strong></span>
              </div>
            )}
          </div>

          <Link href="/deadlines">
            <Button icon={<ArrowLeftOutlined />}>Tất cả deadline</Button>
          </Link>
        </div>
      </div>

      {/* Deadlines List */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            Danh sách Deadline ({deadlines.length})
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Toàn bộ bài tập và mốc thời gian của học phần {subject.code}
          </p>
        </div>
      </div>

      {deadlines.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <Empty description="Môn học này hiện chưa có deadline nào." />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {deadlines.map((dl) => (
            <div
              key={dl.id}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Tag color={dl.priority === 'high' ? 'red' : dl.priority === 'medium' ? 'orange' : 'default'}>
                  {dl.priority === 'high' ? 'Quan trọng' : dl.priority === 'medium' ? 'Trung bình' : 'Bình thường'}
                </Tag>
                <DeadlineCountdown dueDate={dl.dueDate} />
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                <Link href={`/deadlines/${dl.id}`} style={{ color: 'inherit' }}>
                  {dl.title}
                </Link>
              </h3>

              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  marginBottom: 16,
                  flex: 1,
                }}
              >
                {dl.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 12,
                  borderTop: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <span>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  Hạn nộp: {new Date(dl.dueDate).toLocaleDateString('vi-VN')}
                </span>
                <Link href={`/deadlines/${dl.id}`}>
                  <Button size="small" type="link">
                    Chi tiết <RightOutlined />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

