'use client';

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { themeConfig } from '@/theme/themeConfig';

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={themeConfig} locale={viVN}>
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}

