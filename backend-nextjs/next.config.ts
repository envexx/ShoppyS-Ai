import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        // Apply CORS headers to API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://shoppy-s-ai-apc2.vercel.app" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Requested-With" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ];
  },
  serverExternalPackages: ['@prisma/client'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['cdn.shopify.com', 'shoppysensay.myshopify.com'],
  },
  // Fix hydration warnings caused by browser extensions
  experimental: {
    optimizePackageImports: ['bcryptjs', 'jsonwebtoken']
  },
  // Output file tracing root to fix workspace warnings
  outputFileTracingRoot: __dirname,
};

export default nextConfig;