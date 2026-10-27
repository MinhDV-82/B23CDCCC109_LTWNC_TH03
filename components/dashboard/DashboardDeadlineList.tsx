'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Table, Tag, Button, Switch, message, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CalendarOutlined,
  RightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { DeadlineWithSubject } from '@/types';
import DeadlineCountdown from '@/components/deadline/DeadlineCountdown';
import { toggleDeadlineProgressAction } from '@/actions/deadline-actions';

interface DashboardDeadlineListProps {
  initialItems: DeadlineWithSubject[];
}

export default function DashboardDeadlineList({
  initialItems,
}: DashboardDeadlineListProps) {
  const [items, setItems] = useState<DeadlineWithSubject[]>(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (deadlineId: string, currentStatus: boolean) => {
    setLoadingId(deadlineId);
    try {
      const res = await toggleDeadlineProgressAction({ deadlineId });
      if (res.success && res.data) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === deadlineId
              ? { ...item, isCompleted: res.data!.isCompleted }
              : item
          )
        );
        if (res.data.isCompleted) {
          message.success('Đã hoàn thành deadline!');
        } else {
          message.info('Đã chuyển về chưa hoàn thành.');
        }
      } else {
        message.error(res.error || 'Cập nhật thất bại.');
      }
    } catch {
      message.error('Lỗi kết nối.');
    } finally {
      setLoadingId(null);
    }
  };

  const columns: ColumnsType<DeadlineWithSubject> = [
    {
      title: 'Môn học',
      dataIndex: ['subject', 'code'],
      key: 'code',
      width: 110,
      render: (_, record) => (
        <Tag color="blue" style={{ fontWeight: 600 }}>
          {record.subject?.code || 'PTIT'}
        </Tag>
      ),
    },
    {
      title: 'Tên Deadline',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record) => (
        <div>
          <Link
            href={`/deadlines/${record.id}`}
            style={{ fontWeight: 600, color: 'var(--text-primary)' }}
          >
            {text}
          </Link>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {record.subject?.name}
          </div>
        </div>
      ),
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 140,
      render: (date: string) => (
        <span style={{ fontSize: '0.85rem' }}>
          <CalendarOutlined style={{ marginRight: 6 }} />
          {new Date(date).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      title: 'Thời gian còn lại',
      key: 'countdown',
      width: 170,
      render: (_, record) => (
        <DeadlineCountdown
          dueDate={record.dueDate}
          isCompleted={record.isCompleted}
        />
      ),
    },
    {
      title: 'Hoàn thành',
      dataIndex: 'isCompleted',
      key: 'isCompleted',
      width: 130,
      align: 'center',
      render: (completed: boolean, record) => (
        <Tooltip title={completed ? 'Bấm để đánh dấu chưa xong' : 'Bấm để đánh dấu hoàn thành'}>
          <Switch
            checked={completed}
            loading={loadingId === record.id}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<ClockCircleOutlined />}
            onChange={() => handleToggle(record.id, completed)}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Chi tiết',
      key: 'action',
      width: 90,
      align: 'right',
      render: (_, record) => (
        <Link href={`/deadlines/${record.id}`}>
          <Button size="small" type="link">
            Xem <RightOutlined />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <Table
        dataSource={items}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 8, showSizeChanger: false }}
      />
    </div>
  );
}

