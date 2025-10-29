import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  webpack: (config) => {
    // Handle PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    return config;
  },
};

export default nextConfig;
