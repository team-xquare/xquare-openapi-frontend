import localFont from "next/font/local";

// 인프라 서비스가 쓰는 Medium(500), ExtraBold(800) 굵기는 인증 화면에서만 불러오도록 따로 정의
export const pretendardAuth = localFont({
  src: [
    { path: "../../app/fonts/Pretendard-Medium.woff2", weight: "500" },
    { path: "../../app/fonts/Pretendard-ExtraBold.woff2", weight: "800" },
  ],
  display: "swap",
  variable: "--font-pretendard-auth",
});

// 500, 800 굵기 글자에만 쓰고, 그 밖의 굵기는 기본 Pretendard로 표시
export const AUTH_FONT_FAMILY =
  "var(--font-pretendard-auth), var(--font-pretendard), sans-serif";
