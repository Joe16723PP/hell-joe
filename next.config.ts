import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
