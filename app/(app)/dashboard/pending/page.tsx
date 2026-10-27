import React from 'react';
import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth';
import { getDeadlines, getSubjects, getProgress } from '@/lib/data-repository';
import { DeadlineWithSubject } from '@/types';
import DashboardDeadlineList from '@/components/dashboard/DashboardDeadlineList';

export const dynamic = 'force-dynamic';

export default async function PendingDeadlinesPage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/pending');
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

  const pendingDeadlines: DeadlineWithSubject[] = deadlines
    .filter((dl) => !progressMap.has(dl.id))
    .map((dl) => ({
      ...dl,
      subject: subjectMap.get(dl.subjectId),
      isCompleted: false,
    }));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          Deadline Chưa Hoàn Thành ({pendingDeadlines.length})
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Các nhiệm vụ còn tồn đọng cần tập trung xử lý đúng hạn.
        </p>
      </div>

      <DashboardDeadlineList initialItems={pendingDeadlines} />
    </div>
  );
}

