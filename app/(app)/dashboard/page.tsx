import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, Row, Col, Statistic, Alert, Button, Tag } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { getServerAuthSession } from '@/lib/auth';
import { getDeadlines, getSubjects, getProgress } from '@/lib/data-repository';
import { DeadlineWithSubject } from '@/types';
import DashboardDeadlineList from '@/components/dashboard/DashboardDeadlineList';
import DeadlineCountdown from '@/components/deadline/DeadlineCountdown';

// SSR Requirement: Dynamic per-request rendering for user-specific session
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const [deadlines, subjects, userProgress] = await Promise.all([
    getDeadlines(),
    getSubjects(),
    getProgress(session.user.id),
  ]);

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const progressMap = new Map(
    userProgress.filter((p) => p.isCompleted).map((p) => [p.deadlineId, p])
  );

  const combinedDeadlines: DeadlineWithSubject[] = deadlines.map((dl) => ({
    ...dl,
    subject: subjectMap.get(dl.subjectId),
    isCompleted: progressMap.has(dl.id),
    completedAt: progressMap.get(dl.id)?.completedAt,
  }));

  const totalDeadlines = combinedDeadlines.length;
  const completedCount = combinedDeadlines.filter((d) => d.isCompleted).length;
  const pendingCount = totalDeadlines - completedCount;

  const now = new Date('2026-10-27T13:54:07+07:00').getTime();

  // Upcoming deadlines that are NOT yet completed and due within 7 days
  const upcomingPending = combinedDeadlines.filter((d) => {
    if (d.isCompleted) return false;
    const diff = new Date(d.dueDate).getTime() - now;
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  });

  return (
    <div>
      {/* Welcome banner */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          Xin chào, {session.user.name || session.user.email}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Chào mừng bạn đến với Cổng quản lý Deadline cá nhân. Hãy hoàn thành các mục ưu tiên dưới đây.
        </p>
      </div>

      {/* Real Statistics from JSON */}
      <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Tổng số Deadline</span>}
              value={totalDeadlines}
              valueStyle={{ color: 'var(--primary)', fontWeight: 800 }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Đã hoàn thành</span>}
              value={completedCount}
              valueStyle={{ color: 'var(--success)', fontWeight: 800 }}
              prefix={<CheckCircleOutlined />}
              suffix={`/ ${totalDeadlines}`}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Chưa hoàn thành</span>}
              value={pendingCount}
              valueStyle={{ color: pendingCount > 0 ? 'var(--warning)' : 'var(--text-secondary)', fontWeight: 800 }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Urgent Alert if upcoming deadlines exist */}
      {upcomingPending.length > 0 && (
        <Alert
          message={
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Chú ý: Bạn có {upcomingPending.length} deadline sắp đến hạn trong tuần này!
            </div>
          }
          description={
            <div style={{ marginTop: 8 }}>
              {upcomingPending.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px dashed #FEF08A',
                  }}
                >
                  <div>
                    <Tag color="blue">{item.subject?.code}</Tag>
                    <Link href={`/deadlines/${item.id}`} style={{ fontWeight: 600, color: '#854D0E' }}>
                      {item.title}
                    </Link>
                  </div>
                  <DeadlineCountdown dueDate={item.dueDate} />
                </div>
              ))}
            </div>
          }
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 28, borderRadius: 'var(--radius)', backgroundColor: '#FEFCE8', border: '1px solid #FEF08A' }}
        />
      )}

      {/* Full Deadline Table */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Tất cả Deadline của tôi
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Bật/tắt công tắc hoàn thành để ghi nhận kết quả học tập cá nhân
          </p>
        </div>
      </div>

      <DashboardDeadlineList initialItems={combinedDeadlines} />
    </div>
  );
}

