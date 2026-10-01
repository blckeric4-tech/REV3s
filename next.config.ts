import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Our product/hero artwork is local SVG. Locked down with a strict CSP.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
