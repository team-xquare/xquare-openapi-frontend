import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import AppLayout from "./AppLayout";
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
  title: "XQUARE Open api",
  description: "Xquare School-Information Access Module",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body suppressHydrationWarning>
        <EmotionRegistry>
          <AppLayout>{children}</AppLayout>
        </EmotionRegistry>
      </body>
    </html>
  );
}
