import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
};

export default function config(phase: string): NextConfig {
  // 403 화면의 "Open API 문서로" 주소는 빌드할 때 들어가므로,
  // 값 없이 빌드해서 배포 화면이 로컬 주소를 가리키지 않도록 빌드를 멈춤
  if (
    phase === PHASE_PRODUCTION_BUILD &&
    !process.env.NEXT_PUBLIC_OPEN_API_DOCS_URL
  ) {
    throw new Error(
      "NEXT_PUBLIC_OPEN_API_DOCS_URL이 없습니다. 403 화면의 'Open API 문서로' 링크가 가리킬 user 앱 주소를 넣고 빌드해 주세요.",
    );
  }

  return nextConfig;
}
