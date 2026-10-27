import { ImageResponse } from 'next/og';
import { getDeadlineById, getSubjectById } from '@/lib/data-repository';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const deadline = await getDeadlineById(params.id);
  const subject = deadline ? await getSubjectById(deadline.subjectId) : null;

  const title = deadline ? deadline.title : 'Chi tiết Deadline Học tập';
  const subjectName = subject ? `${subject.code} - ${subject.name}` : 'Môn học PTIT';
  const dueDateStr = deadline
    ? new Date(deadline.dueDate).toLocaleDateString('vi-VN', {
        dateStyle: 'full',
      })
    : 'Học kỳ I 2026';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          padding: '60px 70px',
          fontFamily: 'sans-serif',
          border: '16px solid #4169E1',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                backgroundColor: '#4169E1',
                color: '#FFFFFF',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: '1px',
              }}
            >
              PTIT
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1F2937' }}>
              Class Deadline Hub
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#EEF2FF',
              color: '#4169E1',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            {subjectName}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
            HẠN NỘP BÀI TẬP / ĐỒ ÁN
          </div>
          <div
            style={{
              fontSize: 46,
              fontWeight: 800,
              color: '#111827',
              lineHeight: 1.25,
              maxHeight: '180px',
              overflow: 'hidden',
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #E5E7EB',
            paddingTop: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: 22, color: '#64748B' }}>Thời hạn:</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#DC2626' }}>
              {dueDateStr}
            </span>
          </div>

          <div style={{ fontSize: 20, color: '#4169E1', fontWeight: 600 }}>
            Hệ thống Quản lý Deadline Lớp Sinh Viên
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

