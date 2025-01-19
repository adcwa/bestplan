/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 禁用服务器端特性
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  transpilePackages: ['framer-motion'],
  webpack: (config, { isServer }) => {
    // 优化客户端打包
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig; 