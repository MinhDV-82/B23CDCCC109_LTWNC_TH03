import React from 'react';
import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth';
import { getDeadlines, getSubjects, getProgress } from '@/lib/data-repository';
import { DeadlineWithSubject } from '@/types';
import DashboardDeadlineList from '@/components/dashboard/DashboardDeadlineList';

export const dynamic = 'force-dynamic';

export default async function CompletedDeadlinesPage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/completed');
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

  const completedDeadlines: DeadlineWithSubject[] = deadlines
    .filter((dl) => progressMap.has(dl.id))
    .map((dl) => ({
      ...dl,
      subject: subjectMap.get(dl.subjectId),
      isCompleted: true,
      completedAt: progressMap.get(dl.id)?.completedAt,
    }));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          Deadline Đã Hoàn Thành ({completedDeadlines.length})
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Danh sách các bài tập bạn đã nộp và đánh dấu hoàn tất.
        </p>
      </div>

      <DashboardDeadlineList initialItems={completedDeadlines} />
    </div>
  );
}

