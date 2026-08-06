import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['bars-engineer-founder-formats.trycloudflare.com', '192.168.1.16:3000', '192.168.1.16'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withSentryConfig(analyzer(nextConfig), {
  silent: true,
  org: "stylishtick",
  project: "frontend",
  widenClientFileUpload: true,
  disableLogger: true,
});
