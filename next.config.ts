import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
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
