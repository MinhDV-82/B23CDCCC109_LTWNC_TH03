'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input, Select, Tag, Button, Empty, Pagination } from 'antd';
import {
  SearchOutlined,
  CalendarOutlined,
  RightOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { Deadline, Subject } from '@/types';
import DeadlineCountdown from './DeadlineCountdown';

interface DeadlineFilterViewProps {
  initialDeadlines: Deadline[];
  subjects: Subject[];
}

export default function DeadlineFilterView({
  initialDeadlines,
  subjects,
}: DeadlineFilterViewProps) {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const subjectMap = useMemo(() => {
    return new Map(subjects.map((s) => [s.id, s]));
  }, [subjects]);

  const filteredDeadlines = useMemo(() => {
    const now = Date.now();

    return initialDeadlines.filter((item) => {
      // 1. Text search
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Filter by subject
      if (selectedSubject !== 'all' && item.subjectId !== selectedSubject) {
        return false;
      }

      // 3. Filter by status
      if (selectedStatus !== 'all') {
        const dueTime = new Date(item.dueDate).getTime();
        const diff = dueTime - now;

        if (selectedStatus === 'upcoming') {
          // Còn hạn và hạn trong vòng 7 ngày
          if (diff < 0 || diff > 7 * 24 * 60 * 60 * 1000) return false;
        } else if (selectedStatus === 'overdue') {
          // Quá hạn
          if (diff >= 0) return false;
        } else if (selectedStatus === 'future') {
          // Hơn 7 ngày
          if (diff <= 7 * 24 * 60 * 60 * 1000) return false;
        }
      }

      return true;
    });
  }, [initialDeadlines, search, selectedSubject, selectedStatus]);

  // Pagination slice
  const paginatedDeadlines = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDeadlines.slice(startIndex, startIndex + pageSize);
  }, [filteredDeadlines, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedSubject('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  const subjectOptions = [
    { value: 'all', label: 'Tất cả môn học' },
    ...subjects.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` })),
  ];

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'upcoming', label: 'Sắp đến hạn (<= 7 ngày)' },
    { value: 'future', label: 'Còn nhiều thời gian (> 7 ngày)' },
    { value: 'overdue', label: 'Đã quá hạn' },
  ];

  return (
    <div>
      {/* Filter toolbar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '20px',
          marginBottom: '28px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <div>
            <label
              htmlFor="deadline-search"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}
            >
              Tìm kiếm deadline
            </label>
            <Input
              id="deadline-search"
              placeholder="Nhập tên bài tập hoặc nội dung..."
              prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              allowClear
            />
          </div>

          <div>
            <label
              htmlFor="subject-filter-select"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}
            >
              Lọc theo môn học
            </label>
            <Select
              id="subject-filter-select"
              style={{ width: '100%' }}
              value={selectedSubject}
              onChange={(val) => {
                setSelectedSubject(val);
                setCurrentPage(1);
              }}
              options={subjectOptions}
            />
          </div>

          <div>
            <label
              htmlFor="status-filter-select"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}
            >
              Lọc theo trạng thái
            </label>
            <Select
              id="status-filter-select"
              style={{ width: '100%' }}
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setCurrentPage(1);
              }}
              options={statusOptions}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
            <Button
              icon={<ClearOutlined />}
              onClick={handleResetFilters}
              style={{ width: '100%', marginTop: 'auto' }}
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Tìm thấy <strong>{filteredDeadlines.length}</strong> deadline phù hợp
        </div>
      </div>

      {/* Deadlines List */}
      {filteredDeadlines.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <Empty description="Không tìm thấy deadline nào phù hợp với bộ lọc." />
          <Button type="primary" onClick={handleResetFilters} style={{ marginTop: 16 }}>
            Xóa điều kiện lọc
          </Button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 20,
              marginBottom: 32,
            }}
          >
            {paginatedDeadlines.map((dl) => {
              const subject = subjectMap.get(dl.subjectId);
              return (
                <div
                  key={dl.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 12,
                    }}
                  >
                    <Tag color="blue">{subject?.code || 'PTIT'}</Tag>
                    <DeadlineCountdown dueDate={dl.dueDate} />
                  </div>

                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      marginBottom: 8,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Link href={`/deadlines/${dl.id}`} style={{ color: 'inherit' }}>
                      {dl.title}
                    </Link>
                  </h3>

                  <div
                    style={{
                      fontSize: '0.825rem',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    {subject?.name}
                  </div>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: 16,
                      flex: 1,
                    }}
                  >
                    {dl.description}
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
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      Hạn: {new Date(dl.dueDate).toLocaleDateString('vi-VN')}
                    </span>
                    <Link href={`/deadlines/${dl.id}`}>
                      <Button size="small" type="link">
                        Chi tiết <RightOutlined />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDeadlines.length > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredDeadlines.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

