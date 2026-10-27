'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  message,
  Card,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { Deadline, Subject } from '@/types';
import { createDeadlineAction, deleteDeadlineAction } from '@/actions/deadline-actions';
import dayjs from 'dayjs';

interface AdminDeadlineManagerProps {
  initialDeadlines: Deadline[];
  subjects: Subject[];
}

export default function AdminDeadlineManager({
  initialDeadlines,
  subjects,
}: AdminDeadlineManagerProps) {
  const router = useRouter();
  const [deadlines, setDeadlines] = useState<Deadline[]>(initialDeadlines);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form] = Form.useForm();
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // Open Create Modal
  const handleOpenModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  // Submit Create Form
  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        subjectId: values.subjectId,
        title: values.title.trim(),
        description: values.description.trim(),
        dueDate: values.dueDate.toISOString(), // ISO 8601
        priority: values.priority || 'medium',
      };

      const res = await createDeadlineAction(payload);
      if (res.success && res.data) {
        message.success(`Đã thêm deadline "${res.data.title}" thành công!`);
        setIsModalOpen(false);
        form.resetFields();
        router.refresh();
      } else {
        message.error(res.error || 'Không thể tạo deadline.');
      }
    } catch {
      // Form validation error
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = (record: Deadline) => {
    Modal.confirm({
      title: 'Xác nhận xóa deadline?',
      icon: <ExclamationCircleOutlined style={{ color: 'var(--error)' }} />,
      content: (
        <div>
          Bạn có chắc chắn muốn xóa bài tập{' '}
          <strong>&quot;{record.title}&quot;</strong>? Thao tác này sẽ xóa vĩnh viễn khỏi
          hệ thống và cập nhật lại tiến độ của toàn bộ sinh viên.
        </div>
      ),
      okText: 'Xóa vĩnh viễn',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      onOk: async () => {
        setDeletingId(record.id);
        try {
          const res = await deleteDeadlineAction({ id: record.id });
          if (res.success) {
            message.success('Đã xóa deadline thành công!');
            setDeadlines((prev) => prev.filter((d) => d.id !== record.id));
            router.refresh();
          } else {
            message.error(res.error || 'Không thể xóa deadline.');
          }
        } catch {
          message.error('Lỗi khi thực hiện yêu cầu xóa.');
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const columns: ColumnsType<Deadline> = [
    {
      title: 'Môn học',
      dataIndex: 'subjectId',
      key: 'subjectId',
      width: 140,
      render: (subjectId: string) => {
        const sub = subjectMap.get(subjectId);
        return (
          <Tag color="blue" style={{ fontWeight: 600 }}>
            {sub?.code || 'PTIT'}
          </Tag>
        );
      },
    },
    {
      title: 'Tên Deadline',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record) => {
        const sub = subjectMap.get(record.subjectId);
        return (
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {sub?.name} • ID: <code style={{ fontSize: '0.75rem' }}>{record.id}</code>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Mức độ',
      dataIndex: 'priority',
      key: 'priority',
      width: 130,
      render: (priority: string) => (
        <Tag color={priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'default'}>
          {priority === 'high' ? 'Quan trọng' : priority === 'medium' ? 'Trung bình' : 'Bình thường'}
        </Tag>
      ),
    },
    {
      title: 'Hạn nộp (Asia/Ho_Chi_Minh)',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 180,
      render: (dateStr: string) => (
        <span style={{ fontSize: '0.85rem' }}>
          <CalendarOutlined style={{ marginRight: 6 }} />
          {new Date(dateStr).toLocaleString('vi-VN', {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone: 'Asia/Ho_Chi_Minh',
          })}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          loading={deletingId === record.id}
          onClick={() => handleDeleteConfirm(record)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Quản Trị Deadline Lớp Học
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Toàn quyền thêm mới và gỡ bỏ các mốc thời gian bài tập của các môn học.
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleOpenModal}
        >
          Thêm Deadline Mới
        </Button>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Table
          dataSource={deadlines}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>

      {/* Modal create deadline */}
      <Modal
        title={
          <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            Tạo Deadline Học Tập Mới
          </div>
        }
        open={isModalOpen}
        onOk={handleCreateSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
        okText="Lưu Deadline"
        cancelText="Đóng"
        destroyOnClose
        width={560}
      >
        <div style={{ marginTop: 16 }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              priority: 'medium',
            }}
          >
            <Form.Item
              name="subjectId"
              label="Môn học phụ trách"
              rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
            >
              <Select
                placeholder="Chọn môn học áp dụng"
                options={subjects.map((s) => ({
                  value: s.id,
                  label: `${s.code} - ${s.name}`,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="title"
              label="Tên / Tiêu đề Deadline"
              rules={[
                { required: true, message: 'Vui lòng nhập tên deadline' },
                { min: 3, message: 'Tiêu đề tối thiểu 3 ký tự' },
              ]}
            >
              <Input placeholder="Ví dụ: Báo cáo Thực hành 03: Tối ưu hoá Next.js" />
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="Thời hạn nộp (Hạn chót)"
              rules={[{ required: true, message: 'Vui lòng chọn ngày và giờ hạn nộp' }]}
            >
              <DatePicker
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                style={{ width: '100%' }}
                placeholder="Chọn ngày và giờ hạn nộp"
              />
            </Form.Item>

            <Form.Item
              name="priority"
              label="Mức độ ưu tiên"
            >
              <Select
                options={[
                  { value: 'high', label: 'Quan trọng (High)' },
                  { value: 'medium', label: 'Trung bình (Medium)' },
                  { value: 'low', label: 'Bình thường (Low)' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả nội dung & Yêu cầu chi tiết"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả yêu cầu' },
                { min: 5, message: 'Mô tả tối thiểu 5 ký tự' },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Nêu rõ yêu cầu nộp file, tài liệu đặc tả, đường dẫn github..."
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}

