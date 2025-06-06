import { config as loadEnv } from "dotenv";
loadEnv();

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  pageExtensions: ["tsx", "mdx", "ts", "js"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
    ],
  },
};

export default nextConfig;
