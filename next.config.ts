import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async redirects() {
    return [
      // JSON Formatter redirects (English)
      {
        source: '/tools/json-viewer',
        destination: '/tools/json-formatter',
        permanent: true,
      },
      {
        source: '/tools/json-beautifier',
        destination: '/tools/json-formatter',
        permanent: true,
      },
      {
        source: '/tools/json-prettify',
        destination: '/tools/json-formatter',
        permanent: true,
      },
      {
        source: '/tools/json-validator',
        destination: '/tools/json-formatter',
        permanent: true,
      },
      {
        source: '/tools/online-json-formatter',
        destination: '/tools/json-formatter',
        permanent: true,
      },
      {
        source: '/tools/json-formatter-online',
        destination: '/tools/json-formatter',
        permanent: true,
      },
      {
        source: '/tools/json-formatter-and-viewer',
        destination: '/tools/json-formatter',
        permanent: true,
      },
      {
        source: '/tools/json-formatter-and-validator',
        destination: '/tools/json-formatter',
        permanent: true,
      },
      // JSON Formatter redirects (Russian)
      {
        source: '/ru/tools/json-viewer',
        destination: '/ru/tools/json-formatter',
        permanent: true,
      },
      {
        source: '/ru/tools/json-beautifier',
        destination: '/ru/tools/json-formatter',
        permanent: true,
      },
      {
        source: '/ru/tools/json-prettify',
        destination: '/ru/tools/json-formatter',
        permanent: true,
      },
      {
        source: '/ru/tools/json-validator',
        destination: '/ru/tools/json-formatter',
        permanent: true,
      },
      {
        source: '/ru/tools/online-json-formatter',
        destination: '/ru/tools/json-formatter',
        permanent: true,
      },
      {
        source: '/ru/tools/json-formatter-online',
        destination: '/ru/tools/json-formatter',
        permanent: true,
      },
      {
        source: '/ru/tools/json-formatter-and-viewer',
        destination: '/ru/tools/json-formatter',
        permanent: true,
      },
      {
        source: '/ru/tools/json-formatter-and-validator',
        destination: '/ru/tools/json-formatter',
        permanent: true,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Handle PDF.js worker and canvas
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    // Ensure PDF.js is properly handled
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        canvas: false,
      };
    }
    
    // Handle PDF.js worker imports
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      type: 'asset/resource',
      generator: {
        filename: 'static/worker/[hash][ext][query]',
      },
    });
    
    return config;
  },
};

export default nextConfig;
