import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel'e deploy için gerekli ayarlar
  output: "standalone",
  experimental: {
    // Server Actions zaten Next.js 14+ varsayılan olarak aktif
  },
};

export default nextConfig;
