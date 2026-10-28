import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import EmotionRegistry from "./EmotionRegistry";

const pretendard = localFont({
  src: [
    { path: "./fonts/Pretendard-Regular.woff2", weight: "400" },
    { path: "./fonts/Pretendard-SemiBold.woff2", weight: "600" },
    { path: "./fonts/Pretendard-Bold.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "XQUARE 데이터 관리자",
  description: "Xquare School-Information Admin",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body suppressHydrationWarning>
        <EmotionRegistry>{children}</EmotionRegistry>
      </body>
    </html>
  );
}
