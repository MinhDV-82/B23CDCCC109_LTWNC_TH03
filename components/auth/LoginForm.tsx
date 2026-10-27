'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Form, Input, Button, Alert, Card, Typography, Divider } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined, GithubOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  // Prevent Open Redirect vulnerability
  const safeCallbackUrl =
    rawCallbackUrl.startsWith('/') && !rawCallbackUrl.startsWith('//')
      ? rawCallbackUrl
      : '/dashboard';

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email.trim(),
        password: values.password,
        callbackUrl: safeCallbackUrl,
      });

      if (result?.error) {
        setErrorMessage('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.');
      } else if (result?.ok) {
        router.push(safeCallbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi kết nối trong quá trình đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email: string, pass: string) => {
    form.setFieldsValue({
      email,
      password: pass,
    });
    setErrorMessage(null);
  };

  return (
    <Card
      style={{
        maxWidth: 440,
        margin: '0 auto',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div
          style={{
            display: 'inline-block',
            background: 'var(--primary)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.9rem',
            padding: '4px 10px',
            borderRadius: 6,
            marginBottom: 10,
          }}
        >
          PTIT
        </div>
        <Title level={3} style={{ marginBottom: 6, color: 'var(--text-primary)' }}>
          Đăng Nhập Cổng Deadline
        </Title>
        <Text type="secondary" style={{ fontSize: '0.9rem' }}>
          Đăng nhập bằng tài khoản sinh viên hoặc ban cán sự lớp
        </Text>
      </div>

      {errorMessage && (
        <Alert
          message={errorMessage}
          type="error"
          showIcon
          style={{ marginBottom: 20, borderRadius: 6 }}
        />
      )}

      <Form
        form={form}
        name="login_form"
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
      >
        <Form.Item
          label="Địa chỉ Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email của bạn' },
            { type: 'email', message: 'Địa chỉ email không đúng định dạng' },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: 'var(--text-secondary)' }} />}
            placeholder="admin@ptit.edu.vn hoặc sv@ptit.edu.vn"
            size="large"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: 'var(--text-secondary)' }} />}
            placeholder="Nhập mật khẩu của bạn"
            size="large"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            icon={<LoginOutlined />}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <Button
        icon={<GithubOutlined />}
        size="large"
        block
        onClick={() => signIn('github', { callbackUrl: safeCallbackUrl })}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          backgroundColor: '#24292F',
          color: '#ffffff',
          border: 'none',
        }}
      >
        Đăng nhập với GitHub
      </Button>

      <Divider style={{ margin: '20px 0 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Tài khoản thử nghiệm (Demo)
      </Divider>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleQuickFill('admin@ptit.edu.vn', 'admin123')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleQuickFill('admin@ptit.edu.vn', 'admin123');
            }
          }}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px dashed #B4C6FC',
            backgroundColor: '#F8FAFF',
            cursor: 'pointer',
            textAlign: 'left',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#EEF2FF';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F8FAFF';
            e.currentTarget.style.borderColor = '#B4C6FC';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
              🔑 Admin (Lớp trưởng)
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
              Điền nhanh ↵
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <code>admin@ptit.edu.vn</code> • Quản trị &amp; thêm/xóa deadline
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => handleQuickFill('sv@ptit.edu.vn', 'sv123456')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleQuickFill('sv@ptit.edu.vn', 'sv123456');
            }
          }}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px dashed #A7F3D0',
            backgroundColor: '#F0FDF4',
            cursor: 'pointer',
            textAlign: 'left',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#DCFCE7';
            e.currentTarget.style.borderColor = 'var(--success)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F0FDF4';
            e.currentTarget.style.borderColor = '#A7F3D0';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--success)' }}>
              🎓 Sinh viên
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
              Điền nhanh ↵
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <code>sv@ptit.edu.vn</code> • Đánh dấu hoàn thành bài tập cá nhân
          </div>
        </div>
      </div>
    </Card>
  );
}

