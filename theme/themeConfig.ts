import type { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#4169E1',
    colorPrimaryHover: '#3158CC',
    colorSuccess: '#16A34A',
    colorWarning: '#D97706',
    colorError: '#DC2626',
    colorTextBase: '#1F2937',
    colorTextSecondary: '#64748B',
    colorBgBase: '#FFFFFF',
    colorBgLayout: '#F7F9FC',
    colorBorder: '#E5E7EB',
    borderRadius: 8,
    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 38,
      fontWeight: 500,
    },
    Card: {
      borderRadiusLG: 10,
    },
    Input: {
      controlHeight: 38,
      borderRadius: 6,
    },
    Select: {
      controlHeight: 38,
      borderRadius: 6,
    },
  },
};

