/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/cssinjs',
    '@ant-design/nextjs-registry'
  ],
  poweredByHeader: false,
  reactStrictMode: true
};

export default nextConfig;

