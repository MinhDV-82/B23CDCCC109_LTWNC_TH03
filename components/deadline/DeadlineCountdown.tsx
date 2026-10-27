'use client';

import React, { useState, useEffect } from 'react';
import { Tag } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

interface DeadlineCountdownProps {
  dueDate: string;
  isCompleted?: boolean;
  className?: string;
}

export default function DeadlineCountdown({
  dueDate,
  isCompleted = false,
  className,
}: DeadlineCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    // Update every minute (60,000ms) to avoid high CPU usage while remaining accurate
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  if (isCompleted) {
    return (
      <Tag
        icon={<CheckCircleOutlined />}
        color="success"
        className={className}
        style={{ fontWeight: 500, padding: '2px 8px' }}
      >
        Đã hoàn thành
      </Tag>
    );
  }

  // Pre-hydration placeholder to prevent hydration mismatch
  if (!mounted) {
    return (
      <Tag
        icon={<ClockCircleOutlined />}
        color="default"
        className={className}
        style={{ fontWeight: 500, padding: '2px 8px' }}
      >
        Đang kiểm tra hạn...
      </Tag>
    );
  }

  const target = new Date(dueDate).getTime();
  const diffMs = target - now;

  if (diffMs < 0) {
    const overdueDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    const label =
      overdueDays === 0
        ? 'Quá hạn hôm nay'
        : `Quá hạn ${overdueDays} ngày`;

    return (
      <Tag
        icon={<ExclamationCircleOutlined />}
        color="error"
        className={className}
        style={{ fontWeight: 600, padding: '2px 8px' }}
      >
        {label}
      </Tag>
    );
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  if (diffMs < oneDayMs) {
    const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    return (
      <Tag
        icon={<ClockCircleOutlined />}
        color="warning"
        className={className}
        style={{ fontWeight: 600, padding: '2px 8px' }}
      >
        Còn {hours} giờ
      </Tag>
    );
  }

  const days = Math.ceil(diffMs / oneDayMs);
  return (
    <Tag
      icon={<ClockCircleOutlined />}
      color={days <= 3 ? 'warning' : 'processing'}
      className={className}
      style={{ fontWeight: 500, padding: '2px 8px' }}
    >
      Còn {days} ngày
    </Tag>
  );
}

