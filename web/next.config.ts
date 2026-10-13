import type { NextConfig } from "next";

const allowedDevOrigins =
  process.env.NODE_ENV === "development"
    ? (process.env.ALLOWED_DEV_ORIGINS ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

const nextConfig: NextConfig = {
  allowedDevOrigins,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "www.pahchanfoundation.org", pathname: "/img/**" }],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
