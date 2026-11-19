import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // packages/api는 TypeScript 소스 그대로라 앱 빌드에서 같이 변환
  transpilePackages: ["@xquare/api"],
};

export default nextConfig;
