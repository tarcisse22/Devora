import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Runtimes are fetched from inside the sandboxed (opaque-origin) runner,
        // so they need CORS headers to load.
        source: "/vendor/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
      {
        // The runner page itself must never run with Devora's origin. It is
        // only ever loaded in a sandboxed iframe; this CSP sandbox enforces
        // that even if someone opens it directly.
        source: "/sandbox/:path*",
        headers: [{ key: "Content-Security-Policy", value: "sandbox allow-scripts" }],
      },
    ];
  },
};

export default nextConfig;
