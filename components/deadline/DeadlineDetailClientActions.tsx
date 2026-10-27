'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button, message, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  CheckOutlined,
  ShareAltOutlined,
  LoginOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { toggleDeadlineProgressAction, checkMyProgressAction } from '@/actions/deadline-actions';

interface DeadlineDetailClientActionsProps {
  deadlineId: string;
}

export default function DeadlineDetailClientActions({
  deadlineId,
}: DeadlineDetailClientActionsProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (session?.user) {
      checkMyProgressAction(deadlineId)
        .then((done) => {
          if (isMounted) {
            setIsCompleted(done);
            setInitialLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setInitialLoading(false);
        });
    } else {
      setInitialLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [session, deadlineId]);

  const handleToggle = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/deadlines/${deadlineId}`);
      return;
    }

    setLoading(true);
    try {
      const res = await toggleDeadlineProgressAction({ deadlineId });
      if (res.success && res.data) {
        setIsCompleted(res.data.isCompleted);
        if (res.data.isCompleted) {
          message.success('Đã đánh dấu hoàn thành deadline!');
        } else {
          message.info('Đã hủy trạng thái hoàn thành.');
        }
      } else {
        message.error(res.error || 'Không thể cập nhật tiến độ.');
      }
    } catch {
      message.error('Lỗi kết nối khi gửi yêu cầu.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          message.success('Đã sao chép liên kết deadline vào bộ nhớ tạm!');
        } else {
          message.info(window.location.href);
        }
      } catch {
        message.error('Không thể tự động sao chép liên kết.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      {status === 'loading' || initialLoading ? (
        <Button disabled icon={<LoadingOutlined />}>
          Đang tải trạng thái...
        </Button>
      ) : session?.user ? (
        <Button
          type={isCompleted ? 'primary' : 'default'}
          style={
            isCompleted
              ? { backgroundColor: 'var(--success)', borderColor: 'var(--success)' }
              : undefined
          }
          icon={isCompleted ? <CheckCircleOutlined /> : <CheckOutlined />}
          loading={loading}
          onClick={handleToggle}
        >
          {isCompleted ? 'Đã hoàn thành (Bấm để hủy)' : 'Đánh dấu hoàn thành'}
        </Button>
      ) : (
        <Tooltip title="Đăng nhập để lưu tiến độ học tập của riêng bạn">
          <Button
            type="dashed"
            icon={<LoginOutlined />}
            onClick={() => router.push(`/login?callbackUrl=/deadlines/${deadlineId}`)}
          >
            Đăng nhập để đánh dấu hoàn thành
          </Button>
        </Tooltip>
      )}

      <Button icon={<ShareAltOutlined />} onClick={handleShare}>
        Chia sẻ liên kết
      </Button>
    </div>
  );
}

