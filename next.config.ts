import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/avatars/**",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/embed/avatars/**",
      },
      {

        protocol: "https",
        hostname: "slqruxkrrgdrqbnzdmlw.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/characters-images/**",
      }
    ],
    dangerouslyAllowSVG: true,
      formats: ["image/avif", "image/webp"],
  },
}

export default nextConfig;
