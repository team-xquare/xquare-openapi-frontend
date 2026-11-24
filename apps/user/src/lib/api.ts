import { createApiClient, createLocalTokenStorage } from "@xquare/api";

// 서버 주소. 값이 없으면 스테이징 서버를 씀 (운영 서버는 아직 준비 중)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://openapi-backend-stag.dsmhs.kr";

export const api = createApiClient({
  baseUrl: API_BASE_URL,
  storage: createLocalTokenStorage("xquare-openapi.user.tokens"),
  // 같은 앱을 연 탭끼리 토큰 재발급을 하나씩 하게 함
  lockName: "xquare-openapi.user.tokens",
  // 토큰 재발급까지 실패하면 다시 로그인하도록 로그인 화면으로 보냄
  onSessionExpired: () => {
    if (typeof window !== "undefined") window.location.replace("/login");
  },
});
