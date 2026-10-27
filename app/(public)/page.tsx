import React from 'react';
import Link from 'next/link';
import { Button, Tag } from 'antd';
import {
  CalendarOutlined,
  BookOutlined,
  RightOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { getSubjects, getDeadlines } from '@/lib/data-repository';
import DeadlineCountdown from '@/components/deadline/DeadlineCountdown';
import styles from './HomePage.module.css';

// Force SSG - Prerender at build time
export const dynamic = 'force-static';

export default async function HomePage() {
  const [subjects, deadlines] = await Promise.all([
    getSubjects(),
    getDeadlines(),
  ]);

  const now = new Date('2026-10-27T13:54:07+07:00').getTime();

  // Dynamic statistics computed from actual JSON records
  const totalDeadlines = deadlines.length;
  const totalSubjects = subjects.length;

  // Upcoming deadlines (within 7 days and not expired)
  const upcomingDeadlines = deadlines.filter((d) => {
    const dueTime = new Date(d.dueDate).getTime();
    const diffDays = (dueTime - now) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  });

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // Featured deadlines: sort by upcoming due date
  const sortedDeadlines = [...deadlines]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.heroTag}>Học kỳ I • Năm học 2026 - 2027</span>
          <h1 className={styles.heroTitle}>Cổng Quản Lý Deadline Lớp Học</h1>
          <p className={styles.heroDesc}>
            Theo dõi tập trung lịch nộp bài tập lớn, thực hành lab và đồ án chuyên ngành. 
            Không bao giờ bỏ lỡ thời hạn với thông báo đếm ngược thời gian thực.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
            <Link href="/deadlines">
              <Button type="primary" size="large" icon={<CalendarOutlined />}>
                Xem tất cả Deadline
              </Button>
            </Link>
            <Link href="/login">
              <Button size="large">Đăng nhập tài khoản</Button>
            </Link>
          </div>

          {/* Real computed stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{totalDeadlines}</div>
              <div className={styles.statLabel}>Tổng số Deadline</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{upcomingDeadlines.length}</div>
              <div className={styles.statLabel}>Sắp đến hạn (7 ngày tới)</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{totalSubjects}</div>
              <div className={styles.statLabel}>Môn học đăng ký</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Deadlines Section */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Deadline Nổi Bật</h2>
              <p className={styles.sectionSubtitle}>
                Các bài tập và đồ án quan trọng cần ưu tiên hoàn thành trước
              </p>
            </div>
            <Link href="/deadlines">
              <Button type="link">
                Xem toàn bộ ({totalDeadlines}) <RightOutlined />
              </Button>
            </Link>
          </div>

          <div className={styles.deadlineGrid}>
            {sortedDeadlines.map((item) => {
              const subject = subjectMap.get(item.subjectId);
              return (
                <div key={item.id} className={styles.cardItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <Tag color="blue">{subject?.code || 'PTIT'}</Tag>
                    <DeadlineCountdown dueDate={item.dueDate} />
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                    <Link href={`/deadlines/${item.id}`} style={{ color: 'inherit' }}>
                      {item.title}
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
                    {item.description}
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
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {new Date(item.dueDate).toLocaleDateString('vi-VN')}
                    </span>
                    <Link href={`/deadlines/${item.id}`}>
                      <Button size="small" type="link">
                        Chi tiết <RightOutlined />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className={styles.section} style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Danh Sách Môn Học</h2>
              <p className={styles.sectionSubtitle}>
                Phân loại bài tập và tiến độ theo từng học phần chuyên ngành
              </p>
            </div>
          </div>

          <div className={styles.subjectGrid}>
            {subjects.map((sub) => {
              const count = deadlines.filter((d) => d.subjectId === sub.id).length;
              return (
                <div key={sub.id} className={styles.cardItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div
                      style={{
                        background: '#EEF2FF',
                        color: 'var(--primary)',
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                      }}
                    >
                      <BookOutlined />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {sub.code}
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {sub.name}
                      </h3>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: 16,
                      flex: 1,
                    }}
                  >
                    {sub.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: 12,
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong>{count}</strong> deadline
                    </span>
                    <Link href={`/subjects/${sub.slug}`}>
                      <Button size="small" type="primary" ghost>
                        Xem môn học
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

