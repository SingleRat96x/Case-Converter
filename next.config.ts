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
      // Reading Time Estimator redirects (English)
      {
        source: '/tools/read-time-estimator',
        destination: '/tools/reading-time-estimator',
        permanent: true,
      },
      {
        source: '/tools/reading-time-calculator',
        destination: '/tools/reading-time-estimator',
        permanent: true,
      },
      {
        source: '/tools/read-time-calculator',
        destination: '/tools/reading-time-estimator',
        permanent: true,
      },
      {
        source: '/tools/estimate-reading-time',
        destination: '/tools/reading-time-estimator',
        permanent: true,
      },
      // Reading Time Estimator redirects (Russian)
      {
        source: '/ru/tools/read-time-estimator',
        destination: '/ru/tools/reading-time-estimator',
        permanent: true,
      },
      {
        source: '/ru/tools/reading-time-calculator',
        destination: '/ru/tools/reading-time-estimator',
        permanent: true,
      },
      {
        source: '/ru/tools/read-time-calculator',
        destination: '/ru/tools/reading-time-estimator',
        permanent: true,
      },
      {
        source: '/ru/tools/estimate-reading-time',
        destination: '/ru/tools/reading-time-estimator',
        permanent: true,
      },
      // Add Line Numbers redirects (English)
      {
        source: '/tools/line-numbering-tool',
        destination: '/tools/add-line-numbers-to-text',
        permanent: true,
      },
      {
        source: '/tools/number-lines',
        destination: '/tools/add-line-numbers-to-text',
        permanent: true,
      },
      {
        source: '/tools/add-line-numbers',
        destination: '/tools/add-line-numbers-to-text',
        permanent: true,
      },
      // Add Line Numbers redirects (Russian)
      {
        source: '/ru/tools/line-numbering-tool',
        destination: '/ru/tools/add-line-numbers-to-text',
        permanent: true,
      },
      {
        source: '/ru/tools/number-lines',
        destination: '/ru/tools/add-line-numbers-to-text',
        permanent: true,
      },
      {
        source: '/ru/tools/add-line-numbers',
        destination: '/ru/tools/add-line-numbers-to-text',
        permanent: true,
      },
      // Add Prefix/Suffix redirects (English)
      {
        source: '/tools/prefix-suffix-lines',
        destination: '/tools/add-prefix-and-suffix-to-lines',
        permanent: true,
      },
      // Add Prefix/Suffix redirects (Russian)
      {
        source: '/ru/tools/prefix-suffix-lines',
        destination: '/ru/tools/add-prefix-and-suffix-to-lines',
        permanent: true,
      },
      // SHA-1 Hash Generator redirects (English)
      {
        source: '/tools/sha1-generator',
        destination: '/tools/sha1-hash-generator',
        permanent: true,
      },
      {
        source: '/tools/sha1-hash',
        destination: '/tools/sha1-hash-generator',
        permanent: true,
      },
      // SHA-1 Hash Generator redirects (Russian)
      {
        source: '/ru/tools/sha1-generator',
        destination: '/ru/tools/sha1-hash-generator',
        permanent: true,
      },
      {
        source: '/ru/tools/sha1-hash',
        destination: '/ru/tools/sha1-hash-generator',
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
