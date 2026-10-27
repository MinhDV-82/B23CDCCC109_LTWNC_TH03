import React from 'react';
import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        backgroundColor: '#ffffff',
        padding: '32px 0 24px',
        marginTop: 'auto',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            Class Deadline Hub - Học viện Công nghệ Bưu chính Viễn thông (PTIT)
          </div>
          <div>Cổng thông tin quản lý thời hạn bài tập và đồ án học tập chuyên nghiệp</div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)' }}>
            Trang chủ
          </Link>
          <Link href="/deadlines" style={{ color: 'var(--text-secondary)' }}>
            Danh sách Deadline
          </Link>
          <Link href="/dashboard" style={{ color: 'var(--text-secondary)' }}>
            Dashboard
          </Link>
        </div>
      </div>
      <div
        className="container"
        style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid #F1F5F9',
          textAlign: 'center',
          fontSize: '0.8rem',
        }}
      >
        © {new Date().getFullYear()} Class Deadline Hub. Bản quyền thuộc về Lớp Sinh Viên PTIT.
      </div>
    </footer>
  );
}

