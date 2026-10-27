import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Breadcrumb, Button, Tag, Divider } from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  BookOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { getDeadlines, getDeadlineById, getSubjectById } from '@/lib/data-repository';
import DeadlineCountdown from '@/components/deadline/DeadlineCountdown';
import DeadlineDetailClientActions from '@/components/deadline/DeadlineDetailClientActions';

interface DeadlineDetailPageProps {
  params: {
    id: string;
  };
}

// ISR: revalidate periodically or on-demand via revalidatePath
export const revalidate = 60;

// Pre-render all existing deadlines at build time (SSG/ISR)
export async function generateStaticParams() {
  const deadlines = await getDeadlines();
  return deadlines.map((d) => ({
    id: d.id,
  }));
}

// Dynamic SEO Metadata
export async function generateMetadata({ params }: DeadlineDetailPageProps): Promise<Metadata> {
  const deadline = await getDeadlineById(params.id);
  if (!deadline) {
    return {
      title: 'Không tìm thấy deadline',
      description: 'Hạn nộp bài tập hoặc đồ án này không tồn tại trong hệ thống.',
    };
  }

  const subject = await getSubjectById(deadline.subjectId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const pageUrl = `${siteUrl}/deadlines/${deadline.id}`;

  return {
    title: `${deadline.title} - ${subject?.code || 'PTIT'}`,
    description: deadline.description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${deadline.title} | Class Deadline Hub`,
      description: deadline.description,
      url: pageUrl,
      type: 'article',
      images: [
        {
          url: `${siteUrl}/deadlines/${deadline.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: deadline.title,
        },
      ],
    },
  };
}

export default async function DeadlineDetailPage({ params }: DeadlineDetailPageProps) {
  const deadline = await getDeadlineById(params.id);

  if (!deadline) {
    notFound();
  }

  const subject = await getSubjectById(deadline.subjectId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Safe JSON-LD BreadcrumbList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: `${siteUrl}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Danh sách Deadline',
        item: `${siteUrl}/deadlines`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: deadline.title,
        item: `${siteUrl}/deadlines/${deadline.id}`,
      },
    ],
  };

  const formattedDueDate = new Date(deadline.dueDate).toLocaleString('vi-VN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  const formattedCreatedDate = new Date(deadline.createdAt).toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      {/* JSON-LD Script for SEO Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link href="/">Trang chủ</Link> },
          { title: <Link href="/deadlines">Deadline</Link> },
          { title: deadline.title },
        ]}
      />

      <div style={{ marginBottom: 16 }}>
        <Link href="/deadlines">
          <Button icon={<ArrowLeftOutlined />}>Quay lại danh sách</Button>
        </Link>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {subject && (
              <Link href={`/subjects/${subject.slug}`}>
                <Tag color="blue" style={{ fontSize: '0.85rem', fontWeight: 700, padding: '3px 10px', cursor: 'pointer' }}>
                  <BookOutlined style={{ marginRight: 4 }} />
                  {subject.code} - {subject.name}
                </Tag>
              </Link>
            )}
            <Tag color={deadline.priority === 'high' ? 'red' : deadline.priority === 'medium' ? 'orange' : 'default'}>
              {deadline.priority === 'high' ? 'Mức độ: Quan trọng' : deadline.priority === 'medium' ? 'Mức độ: Trung bình' : 'Mức độ: Bình thường'}
            </Tag>
          </div>

          <DeadlineCountdown dueDate={deadline.dueDate} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, lineHeight: 1.3 }}>
          {deadline.title}
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            background: 'var(--bg-secondary)',
            padding: '16px 20px',
            borderRadius: 'var(--radius)',
            marginBottom: 24,
            border: '1px solid var(--border)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
              <CalendarOutlined style={{ marginRight: 6 }} />
              Hạn nộp chính thức:
            </div>
            <div style={{ fontWeight: 700, color: 'var(--error)', fontSize: '0.95rem' }}>
              {formattedDueDate}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
              <ClockCircleOutlined style={{ marginRight: 6 }} />
              Ngày thông báo:
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              {formattedCreatedDate}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
              <InfoCircleOutlined style={{ marginRight: 6 }} />
              Mã quản lý:
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
              {deadline.id}
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
            Nội dung chi tiết & Yêu cầu:
          </h2>
          <div
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-line',
              background: '#FAFCFF',
              padding: '20px',
              borderRadius: 'var(--radius)',
              border: '1px solid #E2E8F0',
            }}
          >
            {deadline.description}
          </div>
        </div>

        <Divider style={{ margin: '28px 0' }} />

        {/* Interactive client actions: mark complete & share */}
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
            Thao tác của sinh viên:
          </div>
          <DeadlineDetailClientActions deadlineId={deadline.id} />
        </div>
      </div>
    </div>
  );
}

